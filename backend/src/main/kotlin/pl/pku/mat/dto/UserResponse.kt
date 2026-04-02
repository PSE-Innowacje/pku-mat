package pl.pku.mat.dto

data class UserResponse(
    val id: Long,
    val username: String,
    val displayName: String,
    val role: String
)
