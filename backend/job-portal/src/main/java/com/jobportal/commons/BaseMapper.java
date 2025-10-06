package com.jobportal.commons;

import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;
import java.util.List;

public interface BaseMapper <E, R, C, U>{
    R tResource(E entity);

    List<R> tResourceList(List<E> entities);

    default Page<R> tResourcePage(Page<E> entities) {
        return entities.map(this::tResource);
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    E tEntity(C createRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(U updateRequest, @MappingTarget E entity);
}
