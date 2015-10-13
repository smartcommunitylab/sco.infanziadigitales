package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.diary.model.DiaryEntry;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKidProfile;
import it.smartcommunitylab.ungiorno.diary.model.DiaryUser;
import it.smartcommunitylab.ungiorno.diary.model.MultimediaEntry;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.common.collect.Lists;

@RestController
public class DiaryController {

	@Autowired
	private RepositoryManager storage;

	@Autowired
	private AppSetup appSetup;

	@RequestMapping(method = RequestMethod.GET, value = "/diary/{appId}/{schoolId}/{kidId}/entries")
	public Response<List<DiaryEntry>> getDiary(@PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam boolean isTeacher,
			@RequestParam(required=false) String search, @RequestParam(required=false) Integer skip, @RequestParam(required=false) Integer pageSize, @RequestParam(required=false) Long from, @RequestParam(required=false) Long to,
			@RequestParam(required=false) String tag) {

		try {
			if (!isKidDiaryEnabled(appId, schoolId, kidId)) {
				return new Response<>();		
			}

			DiaryUser du = getUser(appId, schoolId, isTeacher);
			List<String> ids = getIds(du);
			if (!ids.contains(kidId)) {
				return new Response<>();
			}

			return new Response<>(storage.getDiary(appId, schoolId, kidId, search, skip, pageSize, from, to, tag));
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.POST, value = "/diary/{appId}/{schoolId}/{kidId}/entry")
	public Response<DiaryEntry> addEntry(@RequestBody DiaryEntry diary, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @RequestParam boolean isTeacher) {

		try {
			if (!isKidDiaryEnabled(appId, schoolId, kidId)) {
				return new Response<>();		
			}
			
			DiaryUser du = getUser(appId, schoolId, isTeacher);
			List<String> ids = getIds(du);
			if (!ids.contains(kidId)) {
				return new Response<>();
			}

			diary.setAppId(appId);
			diary.setSchoolId(schoolId);
			diary.setKidId(kidId);
			diary.setAuthorId(isTeacher ? du.getTeacherId() : du.getParentId());
			diary.setDate(System.currentTimeMillis());

			String entryId = diary.getDate() + "_" + appId + "_" + schoolId + "_" + diary.getAuthorId() + "_" + kidId;
			diary.setEntryId(entryId);

			storage.saveDiaryEntry(diary);
			return new Response<>(diary);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	@RequestMapping(method = RequestMethod.PUT, value = "/diary/{appId}/{schoolId}/{kidId}/{entryId}/entry")
	public void updateEntry(@RequestBody DiaryEntry diary, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId, @PathVariable String entryId,
			@RequestParam boolean isTeacher) {

		try {
			if (!isKidDiaryEnabled(appId, schoolId, kidId)) {
				return;		
			}
			
			DiaryUser du = getUser(appId, schoolId, isTeacher);
			List<String> ids = getIds(du);
			if (!ids.contains(kidId)) {
				return;
			}

			DiaryEntry old = storage.getDiaryEntry(appId, schoolId, kidId, entryId);
			if (old != null) {
				old.setText(diary.getText());
				old.setTags(diary.getTags());
				old.setPictures(diary.getPictures());
			}

			storage.saveDiaryEntry(old);
		} catch (Exception e) {
		}
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
			@RequestParam boolean isTeacher) {

		try {
			if (!isKidDiaryEnabled(appId, schoolId, kidId)) {
				return;		
			}
			
			DiaryUser du = getUser(appId, schoolId, isTeacher);
			List<String> ids = getIds(du);
			if (!ids.contains(kidId)) {
				return;
			}

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

		} catch (Exception e) {
		}
	}	
	
	@RequestMapping(method = RequestMethod.POST, value = "/diary/{appId}/{schoolId}/{kidId}/image")
	public Response<String> uploadImage(MultipartHttpServletRequest req, @PathVariable String appId, @PathVariable String schoolId, @PathVariable String kidId) throws Exception {
		Response<String> res = new Response<String>();
		
		MultiValueMap<String, MultipartFile> multiFileMap = req.getMultiFileMap();
		try {
			if (!isKidDiaryEnabled(appId, schoolId, kidId)) {
				return new Response<>();		
			}
			
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
	 */
	private boolean isKidDiaryEnabled(String appId, String schoolId, String kidId) {
		KidProfile kid = storage.getKidProfile(appId, schoolId, kidId);
		return kid != null && kid.getSharedDiary();
	}	
	

	private DiaryUser getUser(String appId, String schoolId, boolean isTeacher) {
		String userId = "marco@gmail.com";
		DiaryUser du = new DiaryUser();

		if (isTeacher) {
			Teacher teacher = storage.getTeacher(userId, appId, schoolId);
			if (teacher != null) {
				du.setTeacherId(teacher.getTeacherId());
				List<DiaryKidProfile> kids = storage.getDiaryKidProfilesByAuthId(appId, schoolId, teacher.getTeacherId());
				du.setStudents(kids);
			}
		} else {
			Parent parent = storage.getParent(userId, appId, schoolId);
			if (parent != null) {
				du.setParentId(parent.getPersonId());
				List<DiaryKidProfile> kids = storage.getDiaryKidProfilesByAuthId(appId, schoolId, parent.getPersonId());
				du.setSons(kids);
			}
		}

		return du;

	}

	private List<String> getIds(DiaryUser du) {
		List<String> ids = Lists.newArrayList();
		for (DiaryKidProfile k : du.getStudents()) {
			ids.add(k.getKidId());
		}
		for (DiaryKidProfile k : du.getSons()) {
			ids.add(k.getKidId());
		}
		return ids;
	}

}
