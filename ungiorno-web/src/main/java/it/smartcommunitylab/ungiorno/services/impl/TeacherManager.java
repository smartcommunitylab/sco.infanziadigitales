package it.smartcommunitylab.ungiorno.services.impl;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.services.RepositoryService;

@Service
public class TeacherManager {

    @Autowired
    private RepositoryService repoManager;

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

            repoManager.saveOrUpdateTeacher(appId, schoolId, teacher);

        }
        return teacher;
    }

    public Teacher removeFromSectionOrGroup(String appId, String schoolId, String teacherId,
            String sectionId) {
        Teacher teacher = repoManager.getTeacherByTeacherId(teacherId, appId, schoolId);
        if (teacher != null) {
            if (teacher.getSectionIds() != null) {
                teacher.getSectionIds().remove(sectionId);
                repoManager.saveOrUpdateTeacher(appId, schoolId, teacher);
            }
        }
        return teacher;
    }
}
