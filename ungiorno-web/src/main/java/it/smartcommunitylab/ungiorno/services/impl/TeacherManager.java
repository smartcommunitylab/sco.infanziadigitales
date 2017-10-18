package it.smartcommunitylab.ungiorno.services.impl;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.utils.RandomString;

@Service
public class TeacherManager {

    @Autowired
    private RepositoryService repoManager;

    private static RandomString pinGenerator = new RandomString(6);

    public Teacher addToSectionOrGroup(String appId, String schoolId, String teacherId,
            String sectionId) {
        Teacher teacher = repoManager.getTeacherByTeacherId(teacherId, appId, schoolId);
        if (teacher != null) {
            if (teacher.getSectionIds() == null) {
                teacher.setSectionIds(new ArrayList<String>());
            }
            if (!teacher.getSectionIds().contains(sectionId)) {
                teacher.getSectionIds().add(sectionId);
            }

            teacher = repoManager.saveOrUpdateTeacher(appId, schoolId, teacher);

        }
        return teacher;
    }

    public Teacher removeFromSectionOrGroup(String appId, String schoolId, String teacherId,
            String sectionId) {
        Teacher teacher = repoManager.getTeacherByTeacherId(teacherId, appId, schoolId);
        if (teacher != null) {
            if (teacher.getSectionIds() != null) {
                teacher.getSectionIds().remove(sectionId);
                teacher = repoManager.saveOrUpdateTeacher(appId, schoolId, teacher);
            }
        }
        return teacher;
    }


    public Teacher generatePin(String appId, String schoolId, String teacherId) {
        Teacher teacher = repoManager.getTeacherByTeacherId(teacherId, appId, schoolId);
        if (teacher != null) {
            String pin = generatePin();
            teacher.setPin(pin);
            teacher = repoManager.saveOrUpdateTeacher(appId, schoolId, teacher);
        }

        return teacher;
    }

    private String generatePin() {
        return pinGenerator.nextString();
    }
}
