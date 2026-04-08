package pl.pku.mat.repository

import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.FormTemplateEntity

interface FormTemplateRepository : CrudRepository<FormTemplateEntity, Long> {

    fun findByFeeTypeIdAndContractorTypeId(feeTypeId: Long, contractorTypeId: Long): List<FormTemplateEntity>
}
