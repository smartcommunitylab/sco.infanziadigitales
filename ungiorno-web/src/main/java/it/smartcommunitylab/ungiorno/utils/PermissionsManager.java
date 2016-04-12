package it.smartcommunitylab.ungiorno.utils;

import it.smartcommunitylab.ungiorno.diary.model.DiaryKidProfile;
import it.smartcommunitylab.ungiorno.diary.model.DiaryUser;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.google.common.collect.Lists;

@Component
public class PermissionsManager {

	@Autowired
	private RepositoryManager storage;

	public boolean checkKidProfile(String appId, String schoolId, String kidId, Boolean isTeacher) {
		String userId = getUserId();

		KidProfile kid = storage.getKidProfile(appId, schoolId, kidId);

		if (kid != null) {
			if (isTeacher == null || isTeacher) {
				Teacher teacher = storage.getTeacher(userId, appId, schoolId);
				if (teacher != null) {
					if (teacher.getSectionIds().contains(kid.getSection().getSectionId())) {
						return true;
					}
				}
			}
			if (isTeacher == null || !isTeacher) {
				Parent parent = storage.getParent(userId, appId, schoolId);
				if (parent != null) {
					List<String> personsId = Lists.newArrayList();
					for (AuthPerson person : kid.getPersons()) {
						if (person.getPersonId().equals(parent.getPersonId())) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	public DiaryUser getDiaryUser(String appId, String schoolId, Boolean isTeacher) {
		String userId = getUserId();

		DiaryUser du = new DiaryUser();

		if (isTeacher == null || isTeacher) {
			Teacher teacher = storage.getTeacher(userId, appId, schoolId);
			if (teacher != null) {
				du.setTeacherId(teacher.getTeacherId());
				List<DiaryKidProfile> kids = storage.getDiaryKidProfilesByAuthId(appId, schoolId, teacher.getTeacherId());
				du.setStudents(kids);
			}
		}
		if (isTeacher == null || !isTeacher) {
			Parent parent = storage.getParent(userId, appId, schoolId);
			if (parent != null) {
				du.setParentId(parent.getPersonId());
				List<DiaryKidProfile> kids = storage.getDiaryKidProfilesByAuthId(appId, schoolId, parent.getPersonId());
				du.setSons(kids);
			}
		}

		return du;
	}

	public List<String> getIds(DiaryUser du) {
		List<String> ids = Lists.newArrayList();
		for (DiaryKidProfile k : du.getStudents()) {
			ids.add(k.getKidId());
		}
		for (DiaryKidProfile k : du.getSons()) {
			ids.add(k.getKidId());
		}
		return ids;
	}

	public String getUserId() {
		UserDetails principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return principal.getUsername();
	}

}
