package pl.pku.mat.security

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import pl.pku.mat.repository.RoleRepository
import pl.pku.mat.repository.UserRepository

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User not found: $username")

        if (user.active != 1) {
            throw UsernameNotFoundException("User is inactive: $username")
        }

        val role = roleRepository.findById(user.roleId)
            .orElseThrow { UsernameNotFoundException("Role not found for user: $username") }

        return User.builder()
            .username(user.username)
            .password(user.passwordHash)
            .authorities(SimpleGrantedAuthority("ROLE_${role.name}"))
            .build()
    }
}
