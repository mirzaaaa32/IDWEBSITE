import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect('game_ids.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS game_ids
                 (id TEXT PRIMARY KEY,
                  name TEXT,
                  game_id TEXT,
                  bg_type TEXT,
                  created_at TIMESTAMP)''')
    conn.commit()
    conn.close()

def save_to_database(id, name, game_id, bg_type):
    conn = sqlite3.connect('game_ids.db')
    c = conn.cursor()
    c.execute("INSERT INTO game_ids VALUES (?, ?, ?, ?, ?)",
              (id, name, game_id, bg_type, datetime.now()))
    conn.commit()
    conn.close()

# Initialize database on import
init_db()