package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("CONTRACTORS")
data class ContractorEntity(
    @Id val id: Long? = null,
    val shortName: String,
    val fullName: String,
    val contractorTypeId: Long,
    val userId: Long,
    val createdAt: Instant? = null
)
