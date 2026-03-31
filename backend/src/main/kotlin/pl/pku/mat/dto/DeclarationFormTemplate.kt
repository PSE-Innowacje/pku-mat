package pl.pku.mat.dto

data class DeclarationFormTemplate(
    val feeTypeCode: String,
    val feeTypeName: String,
    val contractorTypeCode: String,
    val fields: List<FormFieldDef>,
    val commentAllowed: Boolean = true
)

data class FormFieldDef(
    val code: String,
    val label: String,
    val type: String = "NUMBER",
    val precision: Int = 0,
    val unit: String? = null,
    val required: Boolean = true
)
