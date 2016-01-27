package eu.cloudopting.service.impl;

import java.util.Date;

import javax.inject.Inject;
import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Service;

import eu.cloudopting.domain.OrganizationStatus;
import eu.cloudopting.domain.OrganizationTypes;
import eu.cloudopting.domain.Organizations;
import eu.cloudopting.domain.util.OrganizationStatusEnum;
import eu.cloudopting.dto.OrganizationDTO;
import eu.cloudopting.events.api.service.AbstractService;
import eu.cloudopting.repository.OrganizationRepository;
import eu.cloudopting.service.OrganizationService;
import eu.cloudopting.service.OrganizationStatusService;
import eu.cloudopting.service.OrganizationTypeService;

@Service
@Transactional
public class OrganizationServiceImpl extends AbstractService<Organizations> implements OrganizationService {

	@Inject
	private OrganizationRepository organizationRepository;

	@Inject
	private OrganizationTypeService organizationTypeService;
	
	@Inject
	private OrganizationStatusService organizationStatusService;
	
	public OrganizationServiceImpl() {
		super(Organizations.class);
	}

	@Override
	protected PagingAndSortingRepository<Organizations, Long> getDao() {
		return organizationRepository;
	}

	@Override
	protected JpaSpecificationExecutor<Organizations> getSpecificationExecutor() {
		return organizationRepository;
	}

	@Override
	public Organizations findOneAndInitCloudAccountCollection(Long organizationId) {
		return organizationRepository.findOneAndInitCloudAccountCollection(organizationId);
	}
	
	@Override
	public Organizations create(OrganizationDTO organizationDTO) {
		Organizations organization = new Organizations();
		copyPropertiesFromDto(organizationDTO, organization);
		
		organization.setOrganizationCreation(new Date());
		setOrganizationType(organization, organizationDTO.getOrganizationType().getId());
		setOrganizationStatus(organization, organizationDTO.getOrganizationStatus().getId());
		return create(organization);
	}

	@Override
	public void update(OrganizationDTO organizationDTO) {
		Organizations organization = findOne(organizationDTO.getId());
		copyPropertiesFromDto(organizationDTO, organization);
		
		if(organizationDTO.getOrganizationType() != null){
			setOrganizationType(organization, organizationDTO.getOrganizationType().getId());
		}
		if(organizationDTO.getOrganizationStatus() != null){
			setOrganizationStatus(organization, organizationDTO.getOrganizationStatus().getId());
		}
		update(organization);
	}
	
	private void copyPropertiesFromDto(OrganizationDTO source, Organizations target){
		if(source.getDescription() != null){
			target.setDescription(source.getDescription());
		}
		if(source.getOrganizationKey() != null){
			target.setOrganizationKey(source.getOrganizationKey());
		}
		if(source.getOrganizationName() != null){
			target.setOrganizationName(source.getOrganizationName());
		}
		if(source.getEmail() != null){
			target.setEmail(source.getEmail());
		}
		if(source.getContactRepresentative() != null){
			target.setContactRepresentative(source.getContactRepresentative());
		}
		if(source.getContactPhone() != null){
			target.setContactPhone(source.getContactPhone());
		}
	}
	
	private void setOrganizationStatus(Organizations organization, Long organizationStatusId){
		OrganizationStatus organizationStatus = organizationStatusService.findOne(organizationStatusId);
		if(organizationStatus == null){
			throw new IllegalArgumentException("Cannot find organization status with id: " + organizationStatusId);
		}
		organization.setOrganizationStatus(organizationStatus);
		OrganizationStatusEnum orgStatusEnum = OrganizationStatusEnum.valueOf(organizationStatus.getStatus());
		if(orgStatusEnum == null){
			throw new IllegalArgumentException("Unsupported org status [" + organizationStatusId + "," + organizationStatus.getStatus() + "]");
		}
		if(orgStatusEnum == OrganizationStatusEnum.VALID){
			organization.setOrganizationActivation(new Date());
		} else if(orgStatusEnum == OrganizationStatusEnum.DECOMISSIONED){
			organization.setOrganizationDecommission(new Date());
		}
	}
	
	private void setOrganizationType(Organizations organization, Long organizationTypeId){
		OrganizationTypes organizationType = organizationTypeService.findOne(organizationTypeId);
		if(organizationType == null){
			throw new IllegalArgumentException("Cannot find organization type with id: " + organizationTypeId);
		}
		organization.setOrganizationType(organizationType);
	}
}
