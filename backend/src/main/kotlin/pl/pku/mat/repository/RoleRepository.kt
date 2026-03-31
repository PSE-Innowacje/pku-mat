package pl.pku.mat.repository

import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.RoleEntity

interface RoleRepository : CrudRepository<RoleEntity, Long>
