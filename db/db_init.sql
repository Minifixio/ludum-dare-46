/**sqlite3 -init db_init.sql main.db ""**/

create table ia(
    id INTEGER PRIMARY KEY,
    coherence INTEGER,
    birthDate INTEGER,
    deathDate INTEGER,
    currentCycle INTEGER,
    creator TEXT,
    log TEXT
)