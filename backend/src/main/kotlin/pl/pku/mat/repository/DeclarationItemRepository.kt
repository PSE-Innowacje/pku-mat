package pl.pku.mat.repository

import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.DeclarationItemEntity

interface DeclarationItemRepository : CrudRepository<DeclarationItemEntity, Long> {
    fun findByDeclarationId(declarationId: Long): List<DeclarationItemEntity>
}
