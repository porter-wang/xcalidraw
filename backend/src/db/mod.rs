use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};

#[derive(Clone)]
pub struct Database {
    pub pool: SqlitePool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        std::fs::create_dir_all("data").ok();
        
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;
        
        Ok(Self { pool })
    }
    
    pub async fn run_migrations(&self) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin BOOLEAN NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        
        // Create default admin user if no users exist
        let user_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
            .fetch_one(&self.pool)
            .await?;
        
        if user_count.0 == 0 {
            let password_hash = argon2::hash_encoded(
                b"admin",
                b"randomsalt",
                &argon2::Config::default()
            ).unwrap();
            
            sqlx::query("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)")
                .bind("admin")
                .bind(password_hash)
                .execute(&self.pool)
                .await?;
            
            println!("Created default admin user (username: admin, password: admin)");
        }
        
        Ok(())
    }
}