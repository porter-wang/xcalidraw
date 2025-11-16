use axum::{Json, extract::State};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::{
    db::Database,
    error::{AppError, Result},
    middleware::auth::Claims,
};

#[derive(Deserialize)]
pub struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    token: String,
    username: String,
}

#[derive(FromRow)]
struct User {
    id: i64,
    username: String,
    password_hash: String,
    is_admin: bool,
}

pub async fn login(
    State(db): State<Database>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>> {
    let user: User = sqlx::query_as("SELECT * FROM users WHERE username = ?")
        .bind(&payload.username)
        .fetch_optional(&db.pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    let valid =
        argon2::verify_encoded(&user.password_hash, payload.password.as_bytes()).unwrap_or(false);

    if !valid {
        return Err(AppError::Unauthorized);
    }

    let claims = Claims {
        sub: user.id,
        username: user.username.clone(),
        exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
    };

    let token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &claims,
        &jsonwebtoken::EncodingKey::from_secret(std::env::var("JWT_SECRET").unwrap().as_bytes()),
    )
    .map_err(|_| AppError::Internal)?;

    Ok(Json(LoginResponse {
        token,
        username: user.username,
    }))
}

pub async fn me() -> Result<Json<serde_json::Value>> {
    Ok(Json(
        serde_json::json!({ "message": "Auth check endpoint - to be implemented" }),
    ))
}
