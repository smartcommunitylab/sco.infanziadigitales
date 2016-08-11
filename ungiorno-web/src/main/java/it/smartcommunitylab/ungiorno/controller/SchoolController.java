/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.config.exception.EntityNotFoundException;
import it.smartcommunitylab.ungiorno.config.exception.UnauthorizedException;
import it.smartcommunitylab.ungiorno.model.BusData;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.GroupData;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;
import it.smartcommunitylab.ungiorno.utils.Utils;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SchoolController {
	private static final transient Logger logger = LoggerFactory.getLogger(SchoolController.class);
	
	@Autowired
	private RepositoryManager storage;
	
	@Autowired
	private PermissionsManager permissions;		

	@RequestMapping(method = RequestMethod.GET, value = "/ping")
	public @ResponseBody
	String ping(HttpServletRequest request, HttpServletResponse response, HttpSession session) {
		return "PONG";
	}


	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/profile")
	public @ResponseBody Response<SchoolProfile> getSchoolProfileForTeacher(@PathVariable String appId,
			@PathVariable String schoolId) 
		throws Exception {
		String userId = permissions.getUserId();
		SchoolProfile profile = storage.getSchoolProfileForUser(appId, schoolId, userId);
		if(profile == null) {
			throw new EntityNotFoundException(String.format("Profile for user with id %s not found", userId));
		}
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getSchoolProfileForTeacher[%s]: %s", appId, userId));
		}
		return new Response<SchoolProfile>(profile);
	}

	@RequestMapping(method = RequestMethod.POST, value = "/school/{appId}/{schoolId}/communications")
	public @ResponseBody Response<Communication> sendCommunication(@RequestBody Communication comm, 
			@PathVariable String appId, @PathVariable String schoolId) throws Exception {
		comm.setAppId(appId);
		comm.setSchoolId(schoolId);
		Communication communication = storage.saveCommunication(comm);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("sendCommunication[%s]: %s", appId, schoolId));
		}
		return new Response<>(communication);
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/communications")
	public @ResponseBody Response<List<Communication>> getComms(@PathVariable String appId, @PathVariable String schoolId) {
		try {
			List<Communication> list = storage.getCommunications(appId, schoolId);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("getComms[%s]: %s", appId, schoolId, list.size()));
			}
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.DELETE, value = "/school/{appId}/{schoolId}/communications/{commId}")
	public @ResponseBody Response<Void> deleteCommunication(@PathVariable String appId, @PathVariable String schoolId, 
			@PathVariable String commId) {
		try {
			storage.deleteCommunication(appId, schoolId, commId);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("deleteCommunication[%s]: %s - %s", appId, schoolId, commId));
			}			
			return new Response<>((Void)null);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/teachers")
	public @ResponseBody Response<List<Teacher>> getTeachers(@PathVariable String appId, @PathVariable String schoolId) {

		try {
			List<Teacher> list = storage.getTeachers(appId, schoolId);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("getTeachers[%s]: %s - %d", appId, schoolId, list.size()));
			}			
			return new Response<>(list);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/buses")
	public @ResponseBody Response<BusData> getBuses(@PathVariable String appId, @PathVariable String schoolId, @RequestParam long date) {
		try {
			BusData busData = storage.getBusData(appId, schoolId, date);
			if(logger.isInfoEnabled()) {
				logger.info(String.format("getBuses[%s]: %s", appId, schoolId));
			}			
			return new Response<>(busData);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/groups")
	public @ResponseBody Response<GroupData> getGroups(@PathVariable String appId, 
			@PathVariable String schoolId, @RequestParam long date) {
		
		GroupData result = storage.getSections(appId, schoolId, date);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getGroups[%s]: %s", appId, schoolId));
		}
		return new Response<>(result);
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
