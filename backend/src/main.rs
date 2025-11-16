use axum::{
    Router,
    routing::{get, post},
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

mod config;
mod db;
mod error;
mod middleware;
mod routes;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    let config = config::Config::from_env(); // Read config
    let db = db::Database::new(&config.database_url) // Initialize database
        .await
        .expect("Failed to initialize database)");
    db.run_migrations().await.expect("Failed to run migrations");
    let app = Router::new()
        .route("/", get(|| async { "Excalidraw Backend API" }))
        .route("/api/auth/login", post(routes::auth::login))
        .route("api/auth/me", get(routes::auth::me))
        .with_state(db)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        );

    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    println!("Backend listening on http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
