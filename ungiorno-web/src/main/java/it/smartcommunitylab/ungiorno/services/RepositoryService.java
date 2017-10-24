package it.smartcommunitylab.ungiorno.services;

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
import it.smartcommunitylab.ungiorno.model.CalendarItem;
import it.smartcommunitylab.ungiorno.model.ChatMessage;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.InternalNote;
import it.smartcommunitylab.ungiorno.model.KidBusData;
import it.smartcommunitylab.ungiorno.model.KidCalAssenza;
import it.smartcommunitylab.ungiorno.model.KidCalFermata;
import it.smartcommunitylab.ungiorno.model.KidCalNote;
import it.smartcommunitylab.ungiorno.model.KidCalNote.Note;
import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.KidProfile.DayDefault;
import it.smartcommunitylab.ungiorno.model.LoginData;
import it.smartcommunitylab.ungiorno.model.Menu;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TeacherCalendar;
import it.smartcommunitylab.ungiorno.storage.App;
import it.smartcommunitylab.ungiorno.usage.UsageEntity;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageActor;


public interface RepositoryService {

    /**
     * @param appId
     */
    void createApp(AppInfo info);

    App getApp(String appId);

    /**
     * @param profile
     */
    void storeSchoolProfile(SchoolProfile profile);

    /**
     * @param appId
     * @param schoolId
     * @return SchoolProfile object or null if it doesn't exist
     */
    SchoolProfile getSchoolProfile(String appId, String schoolId);

    /**
     * @param appId
     * @param name
     * @return SchoolProfile object or null if it doesn't exist
     */
    SchoolProfile getSchoolProfileByName(String appId, String name);


    /**
     * @param appId
     * @param username
     * @return
     */
    SchoolProfile getSchoolProfileForUser(String appId, String username);

    /**
     * @param appId
     * @param schoolId
     * @param children
     */
    void updateAuthorizations(String appId, String schoolId, List<KidProfile> children);

    /**
     * Updates profiles of kids
     * 
     * @param appId
     * @param schoolId
     * @param children
     */
    void updateChildren(String appId, String schoolId, List<KidProfile> children);

    /**
     * Update a kidProfile. If kid doesn't exist it does nothing
     * 
     * @param kid
     * @return
     */
    KidProfile updateKid(KidProfile kid);

    /**
     * @param appId
     * @param schoolId
     * @param schoolId
     * @param parents
     */
    void updateParents(String appId, String schoolId, List<Parent> parents);

    /**
     * @param appId
     * @param schoolId
     * @param teachers
     */
    void updateTeachers(String appId, String schoolId, List<Teacher> teachers);

    Teacher saveOrUpdateTeacher(String appId, String schoolId, Teacher teacher);

    /**
     * Save a kidProfile, if profile already exists it does nothing
     * 
     * @param kidProfile cannot be null and it should have valid appId and kidId fields
     * @return the KidProfile saved
     */
    KidProfile saveKidProfile(KidProfile kidProfile);

    /**
     * @param appId
     * @param schoolId
     */
    List<DiaryKid> updateDiaryKidPersons(String appId, String schoolId);

    /**
     * @param appId
     * @param schoolId
     * @return
     */
    List<Teacher> getTeachers(String appId, String schoolId);

    /**
     * @param appId
     * @param schoolId
     * @param studentId
     * @param from
     * @param to
     * @return
     */
    List<CalendarItem> getCalendar(String appId, String schoolId, String kidId, long from, long to);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    KidProfile getKidProfile(String appId, String schoolId, String kidId);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    KidConfig getKidConfig(String appId, String schoolId, String kidId);

    /**
     * @param config
     * @return
     */
    KidConfig saveConfig(KidConfig config);

    /**
     * @param appId
     * @param username
     * @return
     */
    List<KidProfile> getKidProfilesByParent(String appId, String username)
            throws ProfileNotFoundException;

    List<KidProfile> getKidProfilesBySchool(String appId, String schoolId);

    /**
     * @param appId
     * @param username
     * @return
     */
    List<KidProfile> getKidProfilesByTeacher(String appId, String username);

    /**
     * @param appId
     * @param schoolId
     * @param sectionId
     * @return
     */
    List<KidProfile> getKidsBySection(String appId, String schoolId, String sectionId);

    /**
     * @param appId
     * @param username
     * @return
     */
    List<DiaryKidProfile> getDiaryKidProfilesByAuthId(String appId, String schoolId, String authId,
            boolean isTeacher);

    /**
     * @param stop
     * @return
     */
    KidConfig saveStop(KidCalFermata stop);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param date
     * @return
     */
    KidCalFermata getStop(String appId, String schoolId, String kidId, long date);

    List<KidCalFermata> getStop(String appId, String schoolId, String kidId, long dateFrom,
            long dateTo);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param date
     * @return
     */
    KidCalAssenza getAbsence(String appId, String schoolId, String kidId, long date);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param date
     * @return
     */
    KidCalRitiro getReturn(String appId, String schoolId, String kidId, long date);

    List<KidCalRitiro> getReturn(String appId, String schoolId, String kidId, long dateFrom,
            long dateTo);

    /**
     * @param absence
     * @return
     */
    KidConfig saveAbsence(KidCalAssenza absence);

    /**
     * @param ritiro
     * @return
     */
    KidConfig saveReturn(KidCalRitiro ritiro);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param date
     * @return
     */
    List<KidCalNote> getKidCalNotes(String appId, String schoolId, String kidId, long date);

    /**
     * @param appId
     * @param schoolId
     * @param sectionIds
     * @param date
     * @return
     */
    List<KidCalNote> getKidCalNotesForSection(String appId, String schoolId, String[] sectionIds,
            long date);

    /**
     * @param note
     */
    KidCalNote saveNote(KidCalNote note);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    List<KidProfile.DayDefault> getWeekDefault(String appId, String schoolId, String kidId);

    /**
     * @param note
     */
    List<DayDefault> saveWeekDefault(String appId, String schoolId, String kidId,
            List<DayDefault> days);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    List<KidProfile.DayDefault> getWeekSpecific(String appId, String schoolId, String kidId,
            int weeknr);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param days
     * @return
     */
    List<DayDefault> saveWeekSpecific(String appId, String schoolId, String kidId,
            List<DayDefault> days, int weeknr);

    /**
     * @param appId
     * @param schoolId
     * @return
     */
    List<Communication> getCommunications(String appId, String schoolId);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    List<Communication> getKidCommunications(String appId, String schoolId, String kidId);

    /**
     * @param comm
     * @return
     */
    Communication saveCommunication(Communication comm);

    /**
     * @param comm
     * @return
     */
    Communication getCommunicationById(String appId, String schoolId, String id);

    /**
     * @param appId
     * @param schoolId
     * @param commId
     */
    void deleteCommunication(String appId, String schoolId, String commId);

    /**
     * @param comm
     * @return
     */
    InternalNote saveInternalNote(InternalNote comm);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    List<InternalNote> getInternalNotes(String appId, String schoolId, String[] sectionIds,
            long date);

    /**
     * @param appId
     * @param schoolId
     * @param from
     * @param to
     * @return
     */
    List<Menu> getMeals(String appId, String schoolId, long from, long to);

    /**
     * @param appId
     * @param schoolId
     * @param date
     * @return
     */
    BusData getBusData(String appId, String schoolId, long date);

    /**
     * @param appId
     * @param schoolId
     * @param sections
     * @param date
     * @return
     */
    List<SectionData> getSections(String appId, String schoolId, Collection<String> sections,
            long date);

    GroupDTO getGroupData(String appId, String schoolId, String groupId);

    List<GroupDTO> getGroupsDataBySchool(String appId, String schoolId);

    /**
     * @param appId
     * @param schoolId
     * @return
     */
    List<TeacherCalendar> getTeacherCalendar(String appId, String schoolId, long from, long to);

    /**
     * @param appId
     * @param schoolId
     * @param busData
     */
    void updateKidBusData(String appId, String schoolId, List<KidBusData> busData);

    /**
     * @return
     */
    Teacher getTeacher(String username, String appId, String schoolId);

    Teacher getTeacherByTeacherId(String teacherId, String appId, String schoolId);

    Teacher deleteTeacherByTeacherId(String teacherId, String appId, String schoolId);

    Teacher getTeacherByPin(String pin, String appId, String schoolId);

    /**
     * @return
     */
    Parent getParent(String username, String appId, String schoolId);

    List<DiaryEntry> getDiary(String appId, String schoolId, String kidId, String search,
            Integer skip, Integer pageSize, Long from, Long to, String tag);

    DiaryEntry getDiaryEntry(String appId, String schoolId, String kidId, String entryId);

    void deleteDiaryEntry(String appId, String schoolId, String kidId, String entryId);

    void saveDiaryEntry(DiaryEntry diary);

    MultimediaEntry getMultimediaEntry(String appId, String schoolId, String kidId,
            String multimediaId);

    void saveMultimediaEntry(MultimediaEntry multimediaEntry);

    void sortNotes(List<Note> notes);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    DiaryKid getDiaryKid(String appId, String schoolId, String kidId);

    /**
     * @param kid
     * @param isTeacher
     * @return
     */
    DiaryKid updateDiaryKid(DiaryKid kid, boolean isTeacher);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param skip
     * @param pageSize
     * @param from
     * @param to
     * @return
     */
    List<MultimediaEntry> getMultimediaEntries(String appId, String schoolId, String kidId,
            Integer skip, Integer pageSize, Long from, Long to);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param entryId
     */
    void cleanImages(String appId, String schoolId, String kidId, String entryId);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @param entryId
     * @param oldPics
     */
    void cleanImages(String appId, String schoolId, String kidId, String entryId,
            Set<String> oldPics);

    List<ChatMessage> getChatMessages(String appId, String schoolId, String kidId, long timestamp,
            int limit);

    ChatMessage saveChatMessage(ChatMessage message);

    ChatMessage removeChatMessage(String appId, String schoolId, String messageId);

    ChatMessage updateChatMessage(ChatMessage message);

    ChatMessage chatMessageReceived(String appId, String schoolId, String messageId);

    ChatMessage chatMessageSeen(String appId, String schoolId, String messageId);

    LoginData getTokenData(String username);

    LoginData getTokenDataByPersonId(String personId, String appId);

    void saveTokenData(LoginData loginData);

    /**
     * @param appId
     * @param schoolId
     * @param kidId
     * @return
     */
    Long getUnreadChatMessageCount(String appId, String schoolId, String kidId, String sender);

    /**
     * @param appId
     * @param schoolId
     * @param sentByParent
     * @return
     */
    Map<String, Map<String, Integer>> getAllUnreadChatMessageCount(String appId, String schoolId,
            String sender);

    /**
     * @param appId
     * @param schoolId
     * @param teacherId
     * @return
     */
    Author getTeacherAsAuthor(String appId, String schoolId, String teacherId);

    /**
     * @param appId
     * @param schoolId
     * @param userId
     * @return
     */
    Author getTeacherAsParent(String appId, String schoolId, String userId);

    void saveUsageEntity(UsageEntity entity);

    List<UsageEntity> findUsageEntities(String appId, String schoolId, UsageAction action,
            UsageActor from, UsageActor to, Object extra, Long fromTime, Long toTime);

    long countUsageEntities(String appId, String schoolId, UsageAction action, UsageActor from,
            UsageActor to, Object extra, Long fromTime, Long toTime);

}
