package pl.pku.mat.repository

import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.ContractorTypeEntity

interface ContractorTypeRepository : CrudRepository<ContractorTypeEntity, Long>
