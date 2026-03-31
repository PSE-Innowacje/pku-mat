package pl.pku.mat.dto

data class DashboardResponse(
    val contractorName: String,
    val contractorType: String,
    val year: Int,
    val month: Int,
    val feeDeclarations: List<FeeDeclarationStatus>
)

data class FeeDeclarationStatus(
    val feeTypeCode: String,
    val feeTypeName: String,
    val status: String,
    val declarationId: Long?,
    val declarationNumber: String?
)
