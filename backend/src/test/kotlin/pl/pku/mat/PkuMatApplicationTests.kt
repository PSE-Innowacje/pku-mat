package pl.pku.mat

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import pl.pku.mat.repository.*

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
class PkuMatApplicationTests {

    @MockBean lateinit var userRepository: UserRepository
    @MockBean lateinit var roleRepository: RoleRepository
    @MockBean lateinit var contractorRepository: ContractorRepository
    @MockBean lateinit var contractorTypeRepository: ContractorTypeRepository
    @MockBean lateinit var feeTypeRepository: FeeTypeRepository
    @MockBean lateinit var contractorFeeTypeRepository: ContractorFeeTypeRepository
    @MockBean lateinit var declarationRepository: DeclarationRepository
    @MockBean lateinit var declarationItemRepository: DeclarationItemRepository

    @Test
    fun contextLoads() {
    }
}
