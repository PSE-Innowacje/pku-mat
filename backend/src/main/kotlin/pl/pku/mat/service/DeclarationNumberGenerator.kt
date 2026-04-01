package pl.pku.mat.service

import org.springframework.stereotype.Component

@Component
class DeclarationNumberGenerator {

    fun generate(
        feeTypeCode: String,
        contractorShortName: String,
        year: Int,
        month: Int,
        subPeriod: Int,
        version: Int,
        correction: Boolean = false
    ): String {
        val monthStr = month.toString().padStart(2, '0')
        val subPeriodStr = subPeriod.toString().padStart(2, '0')
        val versionStr = version.toString().padStart(2, '0')
        val base = "OSW/$feeTypeCode/$contractorShortName/$year/$monthStr/$subPeriodStr/$versionStr"
        return if (correction) "$base/KOR" else base
    }
}
