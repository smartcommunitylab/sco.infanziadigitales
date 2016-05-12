package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.diary.model.DiaryEntry;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKid;
import it.smartcommunitylab.ungiorno.diary.model.DiaryUser;
import it.smartcommunitylab.ungiorno.diary.model.MultimediaEntry;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.common.collect.Lists;

@RestController
public class DiaryController {

	@Autowired
	private RepositoryManager storage;
	
	@Autowired
	private PermissionsManager permissions;

	@Autowired
	private AppSetup appSetup;

	@RequestMapping(method = RequestMethod.GET, value = "/diary/{appId}/profile")
	public Response<DiaryUser> getDiaryProfile(@PathVariable String appId) throws ProfileNotFoundException {

		String userId = permissions.getUserId();
		SchoolProfile schoolProfile = storage.getSchoolProfileForUser(appId, userId);
		DiaryUser du = permissions.getDiaryUser(
				appId, 
				schoolProfile != null ? schoolProfile.getSchoolId() : null, null);

		if (du == null) {
			throw new ProfileNotFoundException();
		}
		return new Response<DiaryUser>(du);
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/diary/{appId}/{schoolId}/kids/{kidId}")
	public Response<DiaryKid> getDiaryKid(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam boolean isTeacher) throws ProfileNotFoundException {

		checkKidDiaryEnabled(appId, schoolId, kidId, isTeacher);
		DiaryKid kid = storage.getDiaryKid(appId, schoolId, kidId);
		
		return new Response<DiaryKid>(kid);
	}
	
	@RequestMapping(method = RequestMethod.POST, value = "/diary/{appId}/{schoolId}/kids/{kidId}")
	public Response<DiaryKid> updateDiaryKid(@RequestBody DiaryKid kid, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam boolean isTeacher) throws ProfileNotFoundException {

		checkKidDiaryEnabled(appId, schoolId, kidId, isTeacher);
		kid.setAppId(appId);
		kid.setKidId(kidId);
		kid.setSchoolId(schoolId);
		DiaryKid saved = storage.updateDiaryKid(kid, isTeacher);
		
		return new Response<DiaryKid>(saved);
	}

	@RequestMapping(method = RequestMethod.GET, value = "/diary/{appId}/{schoolId}/{kidId}/entries")
	public Response<List<DiaryEntry>> getDiary(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam boolean isTeacher,
			@RequestParam(required=false) String search, @RequestParam(required=false) Integer skip, @RequestParam(required=false) Integer pageSize, @RequestParam(required=false) Long from, @RequestParam(required=false) Long to,
			@RequestParam(required=false) String tag) {

			checkKidDiaryEnabled(appId, schoolId, kidId, isTeacher);

			return new Response<>(storage.getDiary(appId, schoolId, kidId, search, skip, pageSize, from, to, tag));
	}

	@RequestMapping(method = RequestMethod.POST, value = "/diary/{appId}/{schoolId}/{kidId}/entry")
	public Response<DiaryEntry> addEntry(@RequestBody DiaryEntry diary, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam boolean isTeacher) {

			DiaryUser du = checkKidDiaryEnabled(appId, schoolId, kidId, isTeacher);
			
			diary.setAppId(appId);
			diary.setSchoolId(schoolId);
			diary.setKidId(kidId);
			diary.setAuthorId(isTeacher ? du.getTeacher().getUserId() : du.getParent().getUserId());
			diary.setDate(System.currentTimeMillis());

			String entryId = diary.getDate() + "_" + appId + "_" + schoolId + "_" + diary.getAuthorId() + "_" + kidId;
			diary.setEntryId(entryId);

			storage.saveDiaryEntry(diary);
			return new Response<>(diary);
	}

	@RequestMapping(method = RequestMethod.PUT, value = "/diary/{appId}/{schoolId}/{kidId}/{entryId}/entry")
	public void updateEntry(@RequestBody DiaryEntry diary, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @PathVariable String entryId,
			@RequestParam boolean isTeacher) {

			checkKidDiaryEnabled(appId, schoolId, kidId, isTeacher);

			DiaryEntry old = storage.getDiaryEntry(appId, schoolId, kidId, entryId);
			if (old != null) {
				old.setText(diary.getText());
				old.setTags(diary.getTags());
				old.setPictures(diary.getPictures());
			}

			storage.saveDiaryEntry(old);
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/diary/{appId}/{schoolId}/tags")
	public Response<List<String>> geTags(@PathVariable String appId, @PathVariable String schoolId) {
		try {

			List<String> tags = Lists.newArrayList();
			AppInfo ai = appSetup.getAppsMap().get(appId);
			for (School s : ai.getSchools()) {
				if (s.getSchoolId().equals(schoolId)) {
					tags = s.getTags();
				}
			}

			return new Response<>(tags);

		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/diary/{appId}/{schoolId}/{kidId}/{imageId}/image")
	public void getImage(HttpServletResponse response, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @PathVariable String imageId,
			@RequestParam boolean isTeacher) throws Exception {

		checkKidDiaryEnabled(appId, schoolId, kidId, isTeacher);


		MultimediaEntry multimedia = storage.getMultimediaEntry(appId, schoolId, kidId, imageId);
		if (multimedia != null) {
			File f = new File(appSetup.getUploadDirectory() + "/" + imageId);
			if (f.exists()) {
				String ext = f.getName().substring(f.getName().lastIndexOf(".") + 1);
				response.setContentType("image/" + ext);
			    InputStream is = new FileInputStream(f);
			    IOUtils.copy(is, response.getOutputStream());
			}
		}

	}	
	
	@RequestMapping(method = RequestMethod.POST, value = "/diary/{appId}/{schoolId}/{kidId}/image")
	public Response<String> uploadImage(MultipartHttpServletRequest req, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam boolean isTeacher) throws Exception {
		Response<String> res = new Response<String>();
		
		MultiValueMap<String, MultipartFile> multiFileMap = req.getMultiFileMap();
		try {
			checkKidDiaryEnabled(appId, schoolId, kidId, isTeacher);
			
			if (multiFileMap.containsKey("image")) {
				MultipartFile file = multiFileMap.getFirst("image");
				InputStream is = file.getInputStream();

				
				String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
				String fullName = null;
				String name = null;
				do {
					name = Base64.encodeBase64URLSafeString((System.currentTimeMillis() + "_" + file.getOriginalFilename()).getBytes()) + ext;
					fullName = appSetup.getUploadDirectory() + "/" + name;
				} while (new File(fullName).exists());
				
				FileOutputStream fos = new FileOutputStream(fullName);
				IOUtils.copy(is, fos);
				file.getInputStream().close();
				fos.close();
				
				MultimediaEntry me = new MultimediaEntry();
				me.setAppId(appId);
				me.setSchoolId(schoolId);
				me.setKidId(kidId);
				me.setMultimediaId(name);
				
				storage.saveMultimediaEntry(me);

				res.setData(name);
			}
		} catch (Exception e) {
			res.setError(e.getMessage());
		}
		return res;
	}
	
	/**
	 * @param appId
	 * @param schoolId
	 * @param studentId
	 * @param isTeacher
	 */
	private DiaryUser checkKidDiaryEnabled(String appId, String schoolId, String kidId, Boolean isTeacher) {
		KidProfile kid = storage.getKidProfile(appId, schoolId, kidId);
		if (kid == null) {
			throw new SecurityException("No access to kid "+kidId);
		}
		DiaryUser du = permissions.getDiaryUser(appId, schoolId, isTeacher);
		if (!permissions.hasAccess(du, kidId, schoolId)) {
			throw new SecurityException("No access to kid "+kidId);
		}
		return du;
	}	
	

	@ExceptionHandler(ProfileNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	@ResponseBody
	public String handleProfileNotFoundError(HttpServletRequest request, Exception exception) {
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}	

	@ExceptionHandler(SecurityException.class)
	@ResponseStatus(HttpStatus.UNAUTHORIZED)
	@ResponseBody
	public String handleSecurityError(HttpServletRequest request, Exception exception) {
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}

	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public String handleError(HttpServletRequest request, Exception exception) {
		return "{\"error\":\"" + exception.getMessage() + "\"}";
	}

}

