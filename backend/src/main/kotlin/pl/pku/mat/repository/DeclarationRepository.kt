package pl.pku.mat.repository

import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.DeclarationEntity

interface DeclarationRepository : CrudRepository<DeclarationEntity, Long> {

    fun findByContractorIdAndYearAndMonth(contractorId: Long, year: Int, month: Int): List<DeclarationEntity>

    fun findByContractorId(contractorId: Long): List<DeclarationEntity>

    @Query("""
        SELECT * FROM DECLARATIONS
        WHERE contractor_id = :contractorId
          AND fee_type_id = :feeTypeId
          AND year = :year
          AND month = :month
        ORDER BY version DESC
        FETCH FIRST 1 ROWS ONLY
    """)
    fun findLatestVersion(contractorId: Long, feeTypeId: Long, year: Int, month: Int): DeclarationEntity?
}
