package pl.pku.mat.repository

import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.ContractorEntity

interface ContractorRepository : CrudRepository<ContractorEntity, Long> {
    fun findByUserId(userId: Long): ContractorEntity?
}
