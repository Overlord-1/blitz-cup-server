-- Create the problemset table
create table problemset(
  id uuid primary key default uuid_generate_v4(),
  link varchar(255),
  rating integer,
  used BOOLEAN
);


-- Create the users table
create table users(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cf_handle varchar(255) unique
);



-- Create the mathches table
CREATE TABLE matches(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level varchar(255),
  p1 UUID,
  p2 UUID,
  cf_question UUID,
  winner UUID,
  title varchar(255),
  foreign key (p1) references users(id),
  foreign key (p2) references users(id),
  foreign key (winner) references users(id),
  foreign key (cf_question) references problemset(id)
);
