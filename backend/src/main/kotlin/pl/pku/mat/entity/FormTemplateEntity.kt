package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("FORM_TEMPLATES")
data class FormTemplateEntity(
    @Id val id: Long? = null,
    val feeTypeId: Long,
    val contractorTypeId: Long,
    val versionNumber: Int,
    val versionName: String,
    val fieldsJson: String,
    val createdAt: Instant? = null
)
