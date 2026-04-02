package pl.pku.mat.repository

import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.ContractorFeeTypeEntity

interface ContractorFeeTypeRepository : CrudRepository<ContractorFeeTypeEntity, Long> {
    fun findByContractorId(contractorId: Long): List<ContractorFeeTypeEntity>
}
