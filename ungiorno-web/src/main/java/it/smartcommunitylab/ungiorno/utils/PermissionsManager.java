package it.smartcommunitylab.ungiorno.utils;

import it.smartcommunitylab.ungiorno.diary.model.DiaryKidProfile;
import it.smartcommunitylab.ungiorno.diary.model.DiaryUser;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.Person;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class PermissionsManager {

	@Autowired
	private RepositoryManager storage;

	public boolean checkKidProfile(String appId, String schoolId, String kidId, Boolean isTeacher) {
		//TODO
		String userId = getUserId();

		KidProfile kid = storage.getKidProfile(appId, schoolId, kidId);
		String sectionId = storage.getSectionId(kid);

		if (kid != null) {
			if (isTeacher == null || isTeacher) {
				Teacher teacher = storage.getTeacher(userId, appId, schoolId);
				if (teacher != null) {
					if (teacher.getGroups().contains(sectionId)) {
						return true;
					}
				}
			}
			if (isTeacher == null || !isTeacher) {
				Parent parent = storage.getParent(userId, appId, schoolId);
				if (parent != null) {
					for (String personId : kid.getAuthorizedPersons()) {
						if (parent.getPersonId().equals(personId)) {
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
		du.setAppId(appId);

		if (isTeacher == null || isTeacher) {
			Teacher teacher = storage.getTeacher(userId, appId, schoolId);
			if (teacher != null) {
//				du.setName(teacher.getTeacherName());
//				du.setSurname(teacher.getTeacherSurname());
//				du.setFullname(teacher.getTeacherFullname());
				du.setTeacher(DiaryUser.DiaryUserTeacher.fromTeacher(teacher));
				List<DiaryKidProfile> kids = storage.getDiaryKidProfilesByAuthId(appId, schoolId, teacher.getTeacherId(), true);
				du.setStudents(kids);
			}
		}
		if (isTeacher == null || !isTeacher) {
			Parent parent = storage.getParent(userId, appId, schoolId);
			if (parent != null) {
				du.setName(parent.getFirstName());
				du.setSurname(parent.getLastName());
				du.setFullname(parent.getFullName());

				du.setParent(DiaryUser.DiaryUserParent.fromParent(parent));
				List<DiaryKidProfile> kids = storage.getDiaryKidProfilesByAuthId(appId, schoolId, parent.getPersonId(), false);
				du.setKids(kids);
			}
		}

		return du;
	}
//
//	public List<String> getIds(DiaryUser du) {
//		List<String> ids = Lists.newArrayList();
//		for (String k : du.getStudents()) {
//			ids.add(k);
//		}
//		for (String k : du.getKids()) {
//			ids.add(k);
//		}
//		return ids;
//	}

	public String getUserId() {
		UserDetails principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return principal.getUsername();
	}

	/**
	 * @param du
	 * @param kidId
	 * @param schoolId
	 * @return
	 */
	public boolean hasAccess(DiaryUser du, String kidId, String schoolId) {
		if (du.getStudents() != null) {
			for (DiaryKidProfile p : du.getStudents()) {
				if (p.getKidId().equals(kidId) && p.getSchoolId().equals(schoolId)) {
					return true;
				}
			}
		}
		if (du.getKids() != null) {
			for (DiaryKidProfile p : du.getKids()) {
				if (p.getKidId().equals(kidId) && p.getSchoolId().equals(schoolId)) {
					return true;
				}
			}
		}
		return false;
	}

}
