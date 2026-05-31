-- GafferIQ Supabase PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create managers table
CREATE TABLE IF NOT EXISTS managers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    favorite_formation VARCHAR(10) NOT NULL,
    skin_tone VARCHAR(50) NOT NULL,
    hair_style VARCHAR(50) NOT NULL,
    hair_color VARCHAR(50) NOT NULL,
    shirt_color VARCHAR(50) NOT NULL,
    tactical_knowledge INTEGER CHECK (tactical_knowledge BETWEEN 1 AND 20),
    man_management INTEGER CHECK (man_management BETWEEN 1 AND 20),
    motivation INTEGER CHECK (motivation BETWEEN 1 AND 20),
    scouting INTEGER CHECK (scouting BETWEEN 1 AND 20),
    negotiation INTEGER CHECK (negotiation BETWEEN 1 AND 20),
    reputation_level VARCHAR(50) DEFAULT 'Sunday League',
    playing_style VARCHAR(50) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create saves table
CREATE TABLE IF NOT EXISTS saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES managers(id) ON DELETE CASCADE,
    club_id VARCHAR(100) NOT NULL,
    season INTEGER DEFAULT 1,
    matchday INTEGER DEFAULT 1,
    budget BIGINT NOT NULL,
    board_confidence INTEGER DEFAULT 75 CHECK (board_confidence BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    league VARCHAR(100) NOT NULL,
    badge_url TEXT,
    primary_colour VARCHAR(7) NOT NULL,
    secondary_colour VARCHAR(7) NOT NULL,
    stadium VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    reputation INTEGER CHECK (reputation BETWEEN 1 AND 100),
    wage_budget BIGINT NOT NULL,
    transfer_budget BIGINT NOT NULL
);

-- 4. Create players table
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(100) PRIMARY KEY,
    club_id VARCHAR(100) REFERENCES clubs(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(10) CHECK (position IN ('GK', 'DEF', 'MID', 'ATT')),
    age INTEGER NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    pace INTEGER CHECK (pace BETWEEN 1 AND 99),
    shooting INTEGER CHECK (shooting BETWEEN 1 AND 99),
    passing INTEGER CHECK (passing BETWEEN 1 AND 99),
    dribbling INTEGER CHECK (dribbling BETWEEN 1 AND 99),
    defending INTEGER CHECK (defending BETWEEN 1 AND 99),
    physical INTEGER CHECK (physical BETWEEN 1 AND 99),
    mental INTEGER CHECK (mental BETWEEN 1 AND 99),
    stamina INTEGER CHECK (stamina BETWEEN 1 AND 99),
    overall INTEGER CHECK (overall BETWEEN 1 AND 99),
    potential INTEGER CHECK (potential BETWEEN 1 AND 99),
    wage BIGINT NOT NULL,
    value BIGINT NOT NULL,
    morale INTEGER CHECK (morale BETWEEN 1 AND 100),
    personality VARCHAR(50) NOT NULL,
    contract_expiry INTEGER NOT NULL,
    injury_status VARCHAR(50) DEFAULT 'Fit'
);

-- 5. Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID REFERENCES saves(id) ON DELETE CASCADE,
    home_club_id VARCHAR(100) REFERENCES clubs(id),
    away_club_id VARCHAR(100) REFERENCES clubs(id),
    home_score INTEGER,
    away_score INTEGER,
    events JSONB,
    player_ratings JSONB,
    motm_id VARCHAR(100),
    matchday INTEGER NOT NULL,
    competition VARCHAR(100) DEFAULT 'League',
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create league_table table
CREATE TABLE IF NOT EXISTS league_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID REFERENCES saves(id) ON DELETE CASCADE,
    club_id VARCHAR(100) REFERENCES clubs(id),
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    gf INTEGER DEFAULT 0,
    ga INTEGER DEFAULT 0,
    gd INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    season INTEGER DEFAULT 1
);

-- 7. Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID REFERENCES saves(id) ON DELETE CASCADE,
    player_id VARCHAR(100),
    from_club VARCHAR(255),
    to_club VARCHAR(255),
    fee BIGINT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('permanent', 'loan')),
    transfer_window VARCHAR(50),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saves_manager ON saves(manager_id);
CREATE INDEX IF NOT EXISTS idx_players_club ON players(club_id);
CREATE INDEX IF NOT EXISTS idx_matches_save ON matches(save_id);
CREATE INDEX IF NOT EXISTS idx_league_table_save ON league_table(save_id);
CREATE INDEX IF NOT EXISTS idx_transfers_save ON transfers(save_id);
