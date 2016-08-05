package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.config.exception.EntityNotFoundException;
import it.smartcommunitylab.ungiorno.config.exception.UnauthorizedException;
import it.smartcommunitylab.ungiorno.model.Bus;
import it.smartcommunitylab.ungiorno.model.Group;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Person;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;
import it.smartcommunitylab.ungiorno.utils.Utils;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@Controller
public class CrudController {
	private static final transient Logger logger = LoggerFactory.getLogger(CrudController.class);
	
	@Autowired
	private RepositoryManager storage;

	@Autowired
	private PermissionsManager permissions;
	
	@RequestMapping(method=RequestMethod.GET, value="/api/{appId}/school/{schoolId}")
	public @ResponseBody SchoolProfile getSchoolProfile(@PathVariable String appId, 
			@PathVariable String schoolId) throws Exception {
		SchoolProfile result = null;
		result = storage.getSchoolProfile(appId, schoolId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getSchoolProfile[%s]: %s", appId, schoolId));
		}
		if(result == null) {
			throw new EntityNotFoundException(String.format("Entity with id %d not found", schoolId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/api/{appId}/school")
	public @ResponseBody List<SchoolProfile> getSchooclProfilesByAppId(@PathVariable String appId) throws Exception {
		List<SchoolProfile> result = null;
		result = storage.getSchoolProfileByAppId(appId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getSchoolProfilesByAppId[%s]: %d", appId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/api/{appId}/{schoolId}/kid")
	public @ResponseBody List<KidProfile> getKidProfilesBySchoolId(@PathVariable String appId, 
			@PathVariable String schoolId) throws Exception {
		List<KidProfile> result = null;
		result = storage.getKidProfileBySchoolId(appId, schoolId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getKidProfilesBySchoolId[%s]: %d", appId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/api/{appId}/{schoolId}/group")
	public @ResponseBody List<Group> getGroupDataBySchoolId(@PathVariable String appId, 
			@PathVariable String schoolId) throws Exception {
		List<Group> result = null;
		result = storage.getGroupDataBySchoolId(appId, schoolId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getGroupDataBySchoolId[%s]: %d", appId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/api/{appId}/{schoolId}/bus")
	public @ResponseBody List<Bus> getBusDataBySchoolId(@PathVariable String appId, 
			@PathVariable String schoolId) throws Exception {
		List<Bus> result = null;
		result = storage.getBusDataBySchoolId(appId, schoolId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getBusDataBySchoolId[%s]: %d", appId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/api/{appId}/{schoolId}/person")
	public @ResponseBody List<Person> getPersonDataBySchoolId(@PathVariable String appId, 
			@PathVariable String schoolId) throws Exception {
		List<Person> result = null;
		result = storage.getPersonDataBySchoolId(appId, schoolId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getPersonDataBySchoolId[%s]: %d", appId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/api/{appId}/{schoolId}/teacher")
	public @ResponseBody List<Teacher> getTeacherDataBySchoolId(@PathVariable String appId, 
			@PathVariable String schoolId) throws Exception {
		List<Teacher> result = null;
		result = storage.getTeacherDataBySchoolId(appId, schoolId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getTeacherDataBySchoolId[%s]: %d", appId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/api/{appId}/school")
	public @ResponseBody SchoolProfile saveSchoolProfile(@PathVariable String appId, 
			@RequestBody SchoolProfile profile) throws Exception {
		SchoolProfile result = null;
		if(profile != null) {
			profile.setAppId(appId);
			result = storage.saveSchoolProfile(profile);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("saveSchoolProfile[%s]: %s", appId, profile.getSchoolId()));
			}
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/api/{appId}/{schoolId}/kid")
	public @ResponseBody KidProfile saveKidProfile(@PathVariable String appId, 
			@PathVariable String schoolId, @RequestBody KidProfile profile) throws Exception {
		KidProfile result = null;
		if(profile != null) {
			profile.setAppId(appId);
			profile.setSchoolId(schoolId);
			result = storage.saveKidProfile(profile);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("saveKidProfile[%s]: %s - %s", appId, schoolId, profile.getKidId()));
			}
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/api/{appId}/{schoolId}/group")
	public @ResponseBody Group saveGroup(@PathVariable String appId, 
			@PathVariable String schoolId, @RequestBody Group profile) throws Exception {
		Group result = null;
		if(profile != null) {
			profile.setAppId(appId);
			profile.setSchoolId(schoolId);
			result = storage.saveGroup(profile);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("saveGroup[%s]: %s - %s", appId, schoolId, profile.getGroupId()));
			}
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/api/{appId}/{schoolId}/bus")
	public @ResponseBody Bus saveBus(@PathVariable String appId, 
			@PathVariable String schoolId, @RequestBody Bus profile) throws Exception {
		Bus result = null;
		if(profile != null) {
			profile.setAppId(appId);
			profile.setSchoolId(schoolId);
			result = storage.saveBus(profile);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("saveBus[%s]: %s - %s", appId, schoolId, profile.getBusId()));
			}
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/api/{appId}/{schoolId}/person")
	public @ResponseBody Person savePerson(@PathVariable String appId, 
			@PathVariable String schoolId, @RequestBody Person profile) throws Exception {
		Person result = null;
		if(profile != null) {
			profile.setAppId(appId);
			profile.setSchoolId(schoolId);
			result = storage.savePerson(profile);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("savePerson[%s]: %s - %s", appId, schoolId, profile.getPersonId()));
			}
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/api/{appId}/{schoolId}/teacher")
	public @ResponseBody Teacher saveTeacher(@PathVariable String appId, 
			@PathVariable String schoolId, @RequestBody Teacher profile) throws Exception {
		Teacher result = null;
		if(profile != null) {
			profile.setAppId(appId);
			profile.setSchoolId(schoolId);
			result = storage.saveTeacher(profile);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("saveTeacher[%s]: %s - %s", appId, schoolId, profile.getTeacherId()));
			}
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.DELETE, value="/api/{appId}/{schoolId}/{schoolId}")
	public @ResponseBody SchoolProfile deleteSchoolProfile(@PathVariable String appId, 
			@PathVariable String schoolId) throws Exception {
		SchoolProfile result = null;
		result = storage.removeSchoolProfile(appId, schoolId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteSchoolProfile[%s]: %s", appId, schoolId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.DELETE, value="/api/{appId}/{schoolId}/kid/{kidId}")
	public @ResponseBody KidProfile deleteKidProfile(@PathVariable String appId, 
			@PathVariable String schoolId, @PathVariable String kidId) throws Exception {
		KidProfile result = null;
		result = storage.removeKidProfile(appId, schoolId, kidId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteKidProfile[%s]: %s - %s", appId, schoolId, kidId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.DELETE, value="/api/{appId}/{schoolId}/group/{groupId}")
	public @ResponseBody Group deleteGroup(@PathVariable String appId, 
			@PathVariable String schoolId, @PathVariable String groupId) throws Exception {
		Group result = null;
		result = storage.removeGroup(appId, schoolId, groupId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteGroup[%s]: %s - %s", appId, schoolId, groupId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.DELETE, value="/api/{appId}/{schoolId}/bus/{busId}")
	public @ResponseBody Bus deleteBus(@PathVariable String appId, 
			@PathVariable String schoolId, @PathVariable String busId) throws Exception {
		Bus result = null;
		result = storage.removeBus(appId, schoolId, busId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteBus[%s]: %s - %s", appId, schoolId, busId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.DELETE, value="/api/{appId}/{schoolId}/person/{personId}")
	public @ResponseBody Person deletePerson(@PathVariable String appId, 
			@PathVariable String schoolId, @PathVariable String personId) throws Exception {
		Person result = null;
		result = storage.removePerson(appId, schoolId, personId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deletePerson[%s]: %s - %s", appId, schoolId, personId));
		}
		return result;
	}
	
	@RequestMapping(method=RequestMethod.DELETE, value="/api/{appId}/{schoolId}/teacher/{teacherId}")
	public @ResponseBody Teacher deleteTeacher(@PathVariable String appId, 
			@PathVariable String schoolId, @PathVariable String teacherId) throws Exception {
		Teacher result = null;
		result = storage.removeTeacher(appId, schoolId, teacherId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteTeacher[%s]: %s - %s", appId, schoolId, teacherId));
		}
		return result;
	}
	
	@ExceptionHandler(EntityNotFoundException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleEntityNotFoundError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(UnauthorizedException.class)
	@ResponseStatus(value=HttpStatus.FORBIDDEN)
	@ResponseBody
	public Map<String,String> handleUnauthorizedError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleGenericError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
}
