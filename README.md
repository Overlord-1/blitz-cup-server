# Blitz Cup: 1v1 Competitive Coding Tournament System

Blitz Cup is a distributed computing platform designed to run 1v1 competitive coding tournaments with an automated progression system. Participants compete in a tournament bracket format (R32 → R16 → QF → SF → F) with real-time tracking of solutions.

## System Architecture

The project consists of four main components:

1. **Worker Thread System** (`/Asim`): Monitors Codeforces submissions and determines match winners
2. **Backend Server** (`/server`): Manages tournament structure, participants, and matches
3. **Public Client** (`/client`): Accessible to participants and spectators 
4. **Volunteer Client** (`/volunteer client`): Used by tournament admins/volunteers to manage matches

```mermaid
graph TB
    subgraph "Blitz Cup System"
        CF[Codeforces API] --> Worker
        
        subgraph "Worker Thread System (/Asim)"
            Worker[Flask Worker App] --> Kafka[Kafka Message Broker]
        end
        
        subgraph "Backend Server (/server)"
            API[Express.js API] --> DB[(Supabase Database)]
            Kafka --> Consumer[Kafka Consumer]
            Consumer --> DB
            API --> Consumer
        end
        
        subgraph "Client Applications"
            VClient[Volunteer Client] --> API
            PClient[Public Client] --> API
        end
    end

    PartA[Participant A] --> CF
    PartB[Participant B] --> CF
    Admin[Tournament Admin] --> VClient
    User[User/Spectator] --> PClient
```

## Event Flow Architecture

The system uses an event-driven architecture with Kafka as the message broker to ensure reliable, decoupled communication between components.

```mermaid
sequenceDiagram
    participant Admin as Tournament Admin
    participant VClient as Volunteer Client
    participant Backend as Backend Server
    participant DB as Supabase Database
    participant Worker as Worker Thread
    participant Kafka as Kafka Broker
    participant CF as Codeforces API
    participant User as Participants

    Admin->>VClient: Start tournament (specify round)
    VClient->>Backend: POST /game/start-game
    Backend->>DB: Initialize tournament structure
    Backend->>DB: Create matches with participants
    Backend->>DB: Assign problems to matches
    
    Admin->>VClient: Select match to manage
    VClient->>Backend: POST /question/verify
    Backend->>DB: Verify problem is valid
    
    VClient->>Backend: POST /round/start-game
    Backend->>Worker: Start tracking match
    Worker->>CF: Poll for submissions
    
    User->>CF: Submit solutions
    CF-->>Worker: Submission data
    Worker->>Worker: Determine winner
    Worker->>Kafka: Publish result (match_id, winner)
    
    Kafka-->>Backend: Consume result
    Backend->>DB: Update match with winner
    Backend->>DB: Advance winner to next round
    Backend->>DB: Assign problem for next match
```

## Distributed Computing Architecture

The system implements several distributed computing concepts to ensure scalability, fault tolerance, and responsiveness:

```mermaid
flowchart TB
    subgraph "Distributed Computing Patterns"
        P1[Event Sourcing] --> Kafka
        P2[Publisher-Subscriber] --> Kafka
        P3[Worker Thread Model] --> Worker
        P4[Microservices] --> Components
    end
    
    subgraph "Components"
        Worker[Worker Thread System]
        Backend[Backend Server]
        Clients[Client Applications]
    end
    
    subgraph "Message Broker"
        Kafka[Kafka]
    end
    
    subgraph "Fault Tolerance"
        FT1[Retries with Backoff]
        FT2[Error Handling]
        FT3[Persistent Storage]
    end
    
    Worker --> Kafka
    Kafka --> Backend
    Backend --> Clients
    FT1 & FT2 & FT3 --> Worker
    FT1 & FT2 & FT3 --> Backend
```

## Dispatcher Thread Model

The Worker Thread system implements a dispatcher model for efficient tracking of multiple matches simultaneously:

```mermaid
graph TD
    subgraph "Worker Thread System"
        API[Flask API]
        
        subgraph "Thread Management"
            Dispatcher[Dispatcher Thread]
            TM[Thread Manager]
            TS[Thread Store]
        end
        
        subgraph "Worker Threads"
            WT1[Worker Thread 1]
            WT2[Worker Thread 2]
            WTN[Worker Thread N]
        end
        
        subgraph "Result Management"
            Publisher[Kafka Publisher]
            ResultStore[Result Store]
        end
    end
    
    API -- /start_tracking --> Dispatcher
    Dispatcher --> TM
    TM --> TS
    TM --> WT1 & WT2 & WTN
    WT1 & WT2 & WTN --> ResultStore
    ResultStore --> Publisher
    API -- /check_status --> ResultStore
```

## Kafka Message Architecture

The system uses Kafka for reliable, asynchronous event processing:

```mermaid
graph LR
    subgraph "Kafka Architecture"
        subgraph "Producer (Worker)"
            PT[Tracking Thread]
            KP[Kafka Producer]
        end
        
        subgraph "Kafka Cluster"
            Topic[Results Topic]
        end
        
        subgraph "Consumer (Backend)"
            CG[Consumer Group]
            Handler[Result Handler]
            DB[(Database)]
        end
        
        PT --> KP
        KP --> Topic
        Topic --> CG
        CG --> Handler
        Handler --> DB
    end
```

## Technology Stack

- **Worker Thread System**: Flask, Kafka, Threading
- **Backend Server**: Express.js, Supabase, Kafka
- **Public Client**: React, Vite
- **Volunteer Client**: React, Vite, TailwindCSS
- **Database**: PostgreSQL (via Supabase)
- **Message Broker**: Kafka

## Conclusion

The Blitz Cup system demonstrates several key distributed computing concepts:

1. **Event-Driven Architecture**: Using Kafka for decoupled, asynchronous communication between components
2. **Thread Pooling**: Managing multiple concurrent matches with a thread dispatcher model
3. **Microservices Design**: Separating concerns into distinct services with well-defined interfaces
4. **Fault Tolerance**: Implementing retries, error handling, and persistent storage
5. **Real-Time Communication**: Enabling real-time updates for tournament progress
6. **Scalability**: Designed to handle multiple concurrent matches and participants

This architecture allows the Blitz Cup system to efficiently manage competitive coding tournaments while maintaining scalability, reliability, and responsiveness. 