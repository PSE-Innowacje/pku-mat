package pl.pku.mat.repository

import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.FeeTypeEntity

interface FeeTypeRepository : CrudRepository<FeeTypeEntity, Long> {
    fun findByCode(code: String): FeeTypeEntity?
}
