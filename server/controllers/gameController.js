// import { Kafka } from 'kafkajs';
import { supabase } from "../config/connectDB.js";
import { getSocketIO } from '../config/connectSocket.js';
import { getRandomQuestion } from '../controllers/pollingService.js';
import amqp from 'amqplib';
import axios from 'axios';
import { verifySubmissions, changeQuestion, verifyController } from "./verifyController.js";

import dotenv from 'dotenv';

dotenv.config();

// // Initialize Kafka with retry configuration
// const kafka = new Kafka({
//   clientId: 'blitz-cup-server',
//   brokers: ['localhost:9092'],
//   retry: {
//     initialRetryTime: 100,
//     retries: 8
//   }
// });

// const consumer = kafka.consumer({ 
//   groupId: 'results-group',
//   retry: {
//     restartOnFailure: async (error) => {
//       console.error('Kafka consumer error:', error);
//       return true; // Always try to restart
//     }
//   }
// });

// // Start Kafka consumer with error handling
// const startKafkaConsumer = async () => {
//   try {
//     await consumer.connect();
//     await consumer.subscribe({ topic: 'Results', fromBeginning: true });

//     await consumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         try {
//           const matchData = JSON.parse(message.value.toString());
//           await updateMatchWinner(matchData.match_id, matchData.winner);
//         } catch (error) {
//           console.error('Error processing message:', error);
//         }
//       },
//     });
//   } catch (error) {
//     console.error('Failed to start Kafka consumer:', error);
//     // Attempt to reconnect after delay
//     setTimeout(startKafkaConsumer, 5000);
//   }
// };

// // Start the Kafka consumer when the server starts
// startKafkaConsumer().catch(console.error);

export async function startSubscriber() {
  const connect = await amqp.connect(process.env.CLOUDAMQP_URL + `?heartbeat=60`);
  const channel = await connect.createChannel();

  const QUEUE_NAME = 'winners';

  const q = await channel.assertQueue(QUEUE_NAME, { exclusive: false });

  console.log('Waiting for messages');

  channel.consume(q.queue, msg => {
    if (msg.content) {
      updateMatchWinner(JSON.parse(msg.content.toString()));
      console.log('Received message from Queue');
    }
  }, { noAck: true });
}

async function updateMatchWinner(newData) {

  console.log('updating winner', newData);



  try {
    const { match_id, winner } = newData;
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('cf_handle', winner)
      .single();

    if (!userData) {
      console.error(`User ${winner} not found`);
      return;
    }

    // Get the current match details complete 
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .single();

    // Update the current match with the winner
    await supabase
      .from('matches')
      .update({ winner: userData.id })
      .eq('id', match_id);



    // Calculate next match number
    const nextMatchNumber = Math.floor(matchData.match_number / 2);


    if (matchData.match_number%2 === 1) {
      await supabase
        .from('matches')
        .update({
          p1: userData.id,
        })
        .eq('match_number', nextMatchNumber);
    }
    else {
      await supabase
        .from('matches')
        .update({
          p2: userData.id,
        })
        .eq('match_number', nextMatchNumber);
    }

    // Get the next match details
    // const { data: nextMatchData } = await supabase
    //   .from('matches')
    //   .select('p1, p2, level')
    //   .eq('match_number', nextMatchNumber)
    //   .single();


    const { data: details } = await supabase
      .from('matches')
      .select('p1, p2, level,id')
      .eq('match_number', nextMatchNumber)
      .single();

    // Update the next match

    const io = getSocketIO();
    if (io) {
      console.log(match_id, userData.id);
      const new_winner = userData.id;
      io.emit('new_winner', { match_id, new_winner });
    } else {
      console.error('Socket.IO is not initialized');
    }


    console.log('Details:', details);
    if (details.p1 && details.p2) {

      // make a new question
      const questionId = await getRandomQuestion(details.level);
      console.log(questionId);
      // id-> name

      // name  of user 1
      const { data: user1 } = await supabase
        .from('users')
        .select('cf_handle')
        .eq('id', details.p1)
        .single();


      // name of user2 
      const { data: user2 } = await supabase
        .from('users')
        .select('cf_handle')
        .eq('id', details.p2)
        .single();

       // link of question
      await supabase
        .from('matches')
        .update({ cf_question: questionId })
        .eq('id', details.id);

      let finalNewQuestionId_temp;
      const maxRetries = 100;
      const retryDelay = 500; // 0.5 second

      const findValidQuestion = async (matchId, attempts = 0) => {
        if (attempts >= maxRetries) {
          console.log('Max retries reached, using last attempted question');
          return finalNewQuestionId_temp;
        }

        const verifyResult = await verifySubmissions(matchId);
        if (verifyResult.status === true) {
          return finalNewQuestionId_temp;
        }

        const changeResult = await changeQuestion(matchId);
        finalNewQuestionId_temp = changeResult.newQuestionId;
        console.log(`Attempt ${attempts + 1}: Changing question to:`, finalNewQuestionId_temp);

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return findValidQuestion(matchId, attempts + 1);
      };

      finalNewQuestionId_temp = await findValidQuestion(details.id);
      const finalNewQuestionId = finalNewQuestionId_temp ? finalNewQuestionId_temp : questionId;

      // console.log('Winner cf_handle:', user?.cf_handle);
      // console.log('Question link:', question?.link);

      // console.log(question.link);

      await supabase
        .from('matches')
        .update({
          p1: details.p1,
          p2: details.p2,
          // cf_question: question.link
        })
        .eq('match_number', nextMatchNumber);

      const { data: latest_question } = await supabase
        .from('problemset')
        .select('link')
        .eq('id', finalNewQuestionId)
        .single();

      // final match data
      const finalNewMatchData = {
        p1: user1.cf_handle,
        p2: user2.cf_handle,
        match_id: details.id,
        match_number: nextMatchNumber,
        level: details.level,
        cf_question: latest_question.link
      }
      // publish
      console.log('Update sent through socket');
      console.log('Publishing to match queue:', finalNewMatchData);
      publish_to_match_queue(finalNewMatchData)

    }


  } catch (error) {
    console.error('Error in updateMatchWinner:', error);
  }
}

const publish_to_match_queue = async (match_data) => {
  try {
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL + `?heartbeat=60`);
    const channel = await connection.createChannel();

    await channel.assertQueue('matches', { durable: true });
    channel.sendToQueue('matches', Buffer.from(JSON.stringify(match_data)), { persistent: true });

    console.log('Match data published to queue');
  } catch (error) {
    console.error('Error publishing to match queue:', error);
  }
}

export const getTournamentStatus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournament_status')
      .select('status')
      .eq('id', 1)
      .single()

    if (error) throw error;
    res.status(200).json({ status: data.status });
  } catch (error) {
    console.error('Error fetching tournament status:', error);
    res.status(500).json({ error: 'Failed to fetch tournament status' });
  }
};

const updateMatchIds = async () => {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .order('level', { ascending: true })
      .order('match_number', { ascending: true });

    if (error) throw error;

    let counters = {
      1: 1, // Round of 32 counter
      2: 1, // Round of 16 counter
      3: 1, // Quarter Finals counter
      4: 1, // Semi Finals counter
      5: 1  // Finals counter
    };

    const updates = matches.map(match => {
      let newId = '';
      switch (match.level) {
        case 1:
          newId = `ROUND-OF-32-${counters[1]++}`;
          break;
        case 2:
          newId = `ROUND-OF-16-${counters[2]++}`;
          break;
        case 3:
          newId = `QUARTER-FINAL-${counters[3]++}`;
          break;
        case 4:
          newId = `SEMI-FINAL-${counters[4]++}`;
          break;
        case 5:
          newId = `FINAL-${counters[5]++}`;
          break;
      }
      return {
        id: newId,
        match_number: match.match_number,
        level: match.level,
        p1: match.p1,
        p2: match.p2,
        cf_question: match.cf_question,
        title: match.title
      };
    });

    // Delete existing matches first
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .neq('match_number', -1);

    if (deleteError) throw deleteError;

    // Insert updated matches
    const { error: updateError } = await supabase
      .from('matches')
      .insert(updates);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error updating match IDs:', error);
    throw error;
  }
};

export const startgame = async (req, res) => {
  try {
    const { round } = req.body;

    if (!round || typeof round !== "number" || round < 1) {
      return res.status(400).json({ error: "Invalid round parameter" });
    }

    // Map round to level (1-5)
    const currentLevel = Math.min(round, 5);

    // Set tournament status to true
    const { error: statusError } = await supabase
      .from('tournament_status')
      .update({ status: true })
      .eq('id', 1);

    if (statusError) throw statusError;

    // First, insert the tournament structure
    const { error: structureError } = await supabase.rpc('initialize_tournament_structure');

    if (structureError) {
      throw structureError;
    }

    // Get all eligible players
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("cf_handle, id")
      .eq("max_round", round - 1)
      .limit(32);

    if (userError) throw userError;
    if (!users?.length || users.length < 32) {
      return res.status(404).json({ error: "Not enough users found for this round" });
    }

    // Get unused questions for current level
    const { data: questions, error: questionError } = await supabase
      .from("problemset")
      .select("*")
      .eq("used", false)
      .eq("band", currentLevel)
      .limit(16);

    if (questionError) throw questionError;
    if (!questions?.length || questions.length < 16) {
      return res.status(404).json({ error: `Not enough unused questions available for level ${currentLevel}` });
    }

    const shuffledUsers = users.sort(() => Math.random() - 0.5);

    // Get matches for current level
    const { data: roundMatches, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("level", currentLevel)
      .order('match_number', { ascending: true });

    if (matchError) throw matchError;
    if (!roundMatches?.length) {
      throw new Error(`No matches found for level ${currentLevel}`);
    }

    // Update matches with players and questions
    const updates = roundMatches.slice(0, 16).map((match, i) => ({
      id: match.id,
      p1: shuffledUsers[i * 2]?.id,
      p2: shuffledUsers[i * 2 + 1]?.id,
      cf_question: questions[i]?.id,
      title: questions[i]?.link,
      match_number: match.match_number
    }));

    // Update matches in batch
    const { error: updateError } = await supabase
      .from("matches")
      .upsert(updates);

    if (updateError) throw updateError;

    // Update match IDs
    await updateMatchIds();

    // Update players max_round
    const playerIds = shuffledUsers.slice(0, 32).map(user => user.id);
    const { error: playerUpdateError } = await supabase
      .from("users")
      .update({ max_round: round })
      .in("id", playerIds);

    if (playerUpdateError) throw playerUpdateError;

    // Mark questions as used
    const questionIds = questions.slice(0, 16).map(q => q.id);
    const { error: usedError } = await supabase
      .from("problemset")
      .update({ used: true })
      .in("id", questionIds);

    if (usedError) throw usedError;

    // changes
    for (const update of updates) {
      const matchId = update.id;
      const questionId = update.cf_question;
      const p1Id = update.p1;
      const p2Id = update.p2;

      // Get user handles
      const { data: p1Data } = await supabase
        .from('users')
        .select('cf_handle')
        .eq('id', p1Id)
        .single();
      const { data: p2Data } = await supabase
        .from('users')
        .select('cf_handle')
        .eq('id', p2Id)
        .single();

      const handle1 = p1Data?.cf_handle;
      const handle2 = p2Data?.cf_handle;

      if (!handle1 || !handle2) continue;

      // Fetch submissions and check if solved
      const [submissions1, submissions2] = await Promise.all([
        verifyController(handle1),
        verifyController(handle2)
      ]);

      const handle1Solved = submissions1.some(sub => 
        sub.problem.contestId + sub.problem.index === questions.find(q => q.id === questionId)?.question_id && 
        sub.verdict === 'OK'
      );
      const handle2Solved = submissions2.some(sub => 
        sub.problem.contestId + sub.problem.index === questions.find(q => q.id === questionId)?.question_id && 
        sub.verdict === 'OK'
      );

      if (handle1Solved || handle2Solved) {
        console.log(`Match ${matchId}: Question already solved, changing...`);

        // Change question with retries
        let newQuestionId = await getRandomQuestion(currentLevel);
        let attempts = 0;
        const maxRetries = 10;

        while (attempts < maxRetries) {
          // Verify new question
          const [newSub1, newSub2] = await Promise.all([
            verifyController(handle1),
            verifyController(handle2)
          ]);
          const newSolved1 = newSub1.some(sub => 
            sub.problem.contestId + sub.problem.index === questions.find(q => q.id === newQuestionId)?.question_id && 
            sub.verdict === 'OK'
          );
          const newSolved2 = newSub2.some(sub => 
            sub.problem.contestId + sub.problem.index === questions.find(q => q.id === newQuestionId)?.question_id && 
            sub.verdict === 'OK'
          );

          if (!newSolved1 && !newSolved2) break;

          newQuestionId = await getRandomQuestion(currentLevel);
          attempts++;
        }

        if (attempts >= maxRetries) {
          console.error(`Match ${matchId}: No valid question found after retries`);
          continue;
        }

        // Update match with new question
        await supabase
          .from('matches')
          .update({ cf_question: newQuestionId })
          .eq('id', matchId);

        // Mark old question as unused
        await supabase
          .from('problemset')
          .update({ used: false })
          .eq('id', questionId);

        // Mark new question as used
        await supabase
          .from('problemset')
          .update({ used: true })
          .eq('id', newQuestionId);

        console.log(`Match ${matchId}: Question changed to ${newQuestionId}`);
      }
    }

     const { data: match_data } = await supabase
      .from('matches')
      .select('*')
      .eq('level', 1)
      .order('match_number', { ascending: true });

    console.log(match_data);
    match_data.forEach(async match=>{

      const { data: user1 } = await supabase
        .from('users')
        .select('cf_handle')
        .eq('id', match.p1)
        .single();


      // name of user2 
      const { data: user2 } = await supabase
        .from('users')
        .select('cf_handle')
        .eq('id', match.p2)
        .single();

       // link of question
      const { data: latest_question } = await supabase
        .from('problemset')
        .select('link')
        .eq('id', match.cf_question)
        .single();

        const finalNewMatchData = {
        p1: user1.cf_handle,
        p2: user2.cf_handle,
        match_id: match.id,
        match_number: match.match_number,
        level: match.level,
        cf_question: latest_question.link
      }
      console.log('Publishing to match queue:', finalNewMatchData);
      publish_to_match_queue(finalNewMatchData);

    });

    

    res.status(200).send({ message: "Successfully initialized tournament" });

    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMatches = async (req, res) => {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .neq('match_number', -1)
      .order('match_number', { ascending: true });

    if (error) throw error;

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getMatchesFirst = async (req, res) => {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .neq('match_number', -1)
      .eq('level', 1) // Get only the first level matches
      .order('match_number', { ascending: true });

    if (error) throw error;

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getParticipants = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, cf_handle')
      .order('id');

    if (error) throw error;

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

export const reset = async (req, res) => {
  try {
    // Set tournament status to false
    const { error: statusError } = await supabase
      .from('tournament_status')
      .update({ status: false })
      .eq('id', 1);

    if (statusError) throw statusError;

    // Delete all matches
    const { error: matchError } = await supabase
      .from('matches')
      .delete()
      .neq('match_number', -1);

    if (matchError) throw matchError;

    // Reset all users max_round
    const { error: userError } = await supabase
      .from('users')
      .update({ max_round: 0 })
      .eq('max_round', 1);

    if (userError) throw userError;

    // Reset all questions to unused        id: newId,

    const { error: questionError } = await supabase
      .from('problemset')
      .update({ used: false })
      .eq('used', true);

    if (questionError) throw questionError;

    res.status(200).json({ message: 'Game reset successfully' });
  } catch (error) {
    console.error('Error resetting game:', error);
    res.status(500).json({ error: 'Failed to reset game' });
  }
};

