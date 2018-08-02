package it.smartcommunitylab.ungiorno.test_config;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import it.smartcommunitylab.ungiorno.beans.GroupDTO;
import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.diary.model.DiaryEntry;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKid;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKidProfile;
import it.smartcommunitylab.ungiorno.diary.model.MultimediaEntry;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.Author;
import it.smartcommunitylab.ungiorno.model.BusData;
import it.smartcommunitylab.ungiorno.model.ChatMessage;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.KidProfile.DayDefault;
import it.smartcommunitylab.ungiorno.model.LoginData;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.storage.App;
import it.smartcommunitylab.ungiorno.usage.UsageEntity;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;

public class FakeRepoManager implements RepositoryService {

    @Override
    public void createApp(AppInfo info) {
        // TODO Auto-generated method stub

    }

    @Override
    public App getApp(String appId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void storeSchoolProfile(SchoolProfile profile) {
        // TODO Auto-generated method stub

    }

    @Override
    public SchoolProfile getSchoolProfile(String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public SchoolProfile getSchoolProfileByName(String appId, String name) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public SchoolProfile getSchoolProfileForUser(String appId, String username) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void updateAuthorizations(String appId, String schoolId, List<KidProfile> children) {
        // TODO Auto-generated method stub

    }

    @Override
    public void updateChildren(String appId, String schoolId, List<KidProfile> children) {
        // TODO Auto-generated method stub

    }

    @Override
    public KidProfile updateKid(KidProfile kid) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void updateParents(String appId, String schoolId, List<Parent> parents) {
        // TODO Auto-generated method stub

    }

    @Override
    public void updateTeachers(String appId, String schoolId, List<Teacher> teachers) {
        // TODO Auto-generated method stub

    }

    @Override
    public Teacher saveOrUpdateTeacher(String appId, String schoolId, Teacher teacher) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public KidProfile saveKidProfile(KidProfile kidProfile) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DiaryKid> updateDiaryKidPersons(String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<Teacher> getTeachers(String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public KidProfile getKidProfile(String appId, String schoolId, String kidId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<KidProfile> getKidProfilesByParent(String appId, String username)
            throws ProfileNotFoundException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<KidProfile> getKidProfilesBySchool(String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<KidProfile> getKidProfilesByTeacher(String appId, String username) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<KidProfile> getKidsBySection(String appId, String schoolId, String sectionId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DiaryKidProfile> getDiaryKidProfilesByAuthId(String appId, String schoolId,
            String authId, boolean isTeacher) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DayDefault> getWeekDefault(String appId, String schoolId, String kidId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DayDefault> saveWeekDefault(String appId, String schoolId, String kidId,
            List<DayDefault> days) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DayDefault> getWeekSpecific(String appId, String schoolId, String kidId,
            int weeknr) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DayDefault> saveWeekSpecific(String appId, String schoolId, String kidId,
            List<DayDefault> days, int weeknr) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<Communication> getCommunications(String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<Communication> getKidCommunications(String appId, String schoolId, String kidId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Communication saveCommunication(Communication comm) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Communication getCommunicationById(String appId, String schoolId, String id) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void deleteCommunication(String appId, String schoolId, String commId) {
        // TODO Auto-generated method stub

    }

    @Override
    public BusData getBusData(String appId, String schoolId, long date) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<SectionData> getSections(String appId, String schoolId, Collection<String> sections,
            long date) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public GroupDTO getGroupData(String appId, String schoolId, String groupId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<GroupDTO> getGroupsDataBySchool(String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }


    @Override
    public Teacher getTeacher(String username, String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Teacher getTeacherByTeacherId(String teacherId, String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Teacher deleteTeacherByTeacherId(String teacherId, String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Teacher getTeacherByPin(String pin, String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Parent getParent(String username, String appId, String schoolId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DiaryEntry> getDiary(String appId, String schoolId, String kidId, String search,
            Integer skip, Integer pageSize, Long from, Long to, String tag) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DiaryEntry getDiaryEntry(String appId, String schoolId, String kidId, String entryId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void deleteDiaryEntry(String appId, String schoolId, String kidId, String entryId) {
        // TODO Auto-generated method stub

    }

    @Override
    public void saveDiaryEntry(DiaryEntry diary) {
        // TODO Auto-generated method stub

    }

    @Override
    public MultimediaEntry getMultimediaEntry(String appId, String schoolId, String kidId,
            String multimediaId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void saveMultimediaEntry(MultimediaEntry multimediaEntry) {
        // TODO Auto-generated method stub

    }

    @Override
    public DiaryKid getDiaryKid(String appId, String schoolId, String kidId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DiaryKid updateDiaryKid(DiaryKid kid, boolean isTeacher) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<MultimediaEntry> getMultimediaEntries(String appId, String schoolId, String kidId,
            Integer skip, Integer pageSize, Long from, Long to) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void cleanImages(String appId, String schoolId, String kidId, String entryId) {
        // TODO Auto-generated method stub

    }

    @Override
    public void cleanImages(String appId, String schoolId, String kidId, String entryId,
            Set<String> oldPics) {
        // TODO Auto-generated method stub

    }

    @Override
    public List<ChatMessage> getChatMessages(String appId, String schoolId, String kidId,
            long timestamp, int limit) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ChatMessage saveChatMessage(ChatMessage message) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ChatMessage removeChatMessage(String appId, String schoolId, String messageId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ChatMessage updateChatMessage(ChatMessage message) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ChatMessage chatMessageReceived(String appId, String schoolId, String messageId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ChatMessage chatMessageSeen(String appId, String schoolId, String messageId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public LoginData getTokenData(String username) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public LoginData getTokenDataByPersonId(String personId, String appId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void saveTokenData(LoginData loginData) {
        // TODO Auto-generated method stub

    }

    @Override
    public Long getUnreadChatMessageCount(String appId, String schoolId, String kidId,
            String sender) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Map<String, Map<String, Integer>> getAllUnreadChatMessageCount(String appId,
            String schoolId, String sender) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Author getTeacherAsAuthor(String appId, String schoolId, String teacherId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Author getTeacherAsParent(String appId, String schoolId, String userId) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void saveUsageEntity(UsageEntity entity) {
        // TODO Auto-generated method stub

    }

	/* (non-Javadoc)
	 * @see it.smartcommunitylab.ungiorno.services.RepositoryService#findUsageEntities(java.lang.String, java.lang.String, it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction)
	 */
	@Override
	public List<UsageEntity> findUsageEntities(String appId, String schoolId, UsageAction action) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Parent getParentByPersonId(String personId, String appId) {
		// TODO Auto-generated method stub
		return null;
	}

	/* (non-Javadoc)
	 * @see it.smartcommunitylab.ungiorno.services.RepositoryService#removeKid(java.lang.String, java.lang.String, java.lang.String)
	 */
	@Override
	public void removeKid(String appId, String schoolId, String kidId) {
		// TODO Auto-generated method stub
		
	}
}
