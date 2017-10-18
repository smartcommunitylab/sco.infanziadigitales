package it.smartcommunitylab.ungiorno.services.impl;

import java.net.UnknownHostException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import com.mongodb.MongoClient;
import com.mongodb.MongoException;

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
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.storage.App;
import it.smartcommunitylab.ungiorno.usage.UsageEntity;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageActor;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TeacherManagerTestConfig.class},
        loader = AnnotationConfigContextLoader.class)
public class TeacherManagerTest {

    // @Autowired
    // private TeacherManager teacherManager;


    // TO FIX DEPENDENCIES
    @Test
    public void generatePinForNotExistingTeacher() {
        // Assert.assertThat(teacherManager.generatePin("APP", "SCHOOL", "TEACHER_ID"),
        // Matchers.nullValue());
        Assert.assertTrue(true);
    }


}


@Configuration
@PropertySource("classpath:app.properties")
class TeacherManagerTestConfig {

    private String dbName = "ungiorno-test";

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

    @Bean
    public MongoTemplate getMongo() throws UnknownHostException, MongoException {
        return new MongoTemplate(new MongoClient(), dbName);
    }


    // @Bean
    // public TeacherManager teacherManager() {
    // return new TeacherManager();
    // }


    @Bean
    public RepositoryService repoManager() {
        return new RepositoryService() {

            @Override
            public void updateTeachers(String appId, String schoolId, List<Teacher> teachers) {
                // TODO Auto-generated method stub

            }

            @Override
            public void updateParents(String appId, String schoolId, List<Parent> parents) {
                // TODO Auto-generated method stub

            }

            @Override
            public void updateKidBusData(String appId, String schoolId, List<KidBusData> busData) {
                // TODO Auto-generated method stub

            }

            @Override
            public KidProfile updateKid(KidProfile kid) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<DiaryKid> updateDiaryKidPersons(String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public DiaryKid updateDiaryKid(DiaryKid kid, boolean isTeacher) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public void updateChildren(String appId, String schoolId, List<KidProfile> children) {
                // TODO Auto-generated method stub

            }

            @Override
            public ChatMessage updateChatMessage(ChatMessage message) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public void updateAuthorizations(String appId, String schoolId,
                    List<KidProfile> children) {
                // TODO Auto-generated method stub

            }

            @Override
            public void storeSchoolProfile(SchoolProfile profile) {
                // TODO Auto-generated method stub

            }

            @Override
            public void sortNotes(List<Note> notes) {
                // TODO Auto-generated method stub

            }

            @Override
            public List<DayDefault> saveWeekSpecific(String appId, String schoolId, String kidId,
                    List<DayDefault> days, int weeknr) {
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
            public void saveUsageEntity(UsageEntity entity) {
                // TODO Auto-generated method stub

            }

            @Override
            public void saveTokenData(LoginData loginData) {
                // TODO Auto-generated method stub

            }

            @Override
            public KidConfig saveStop(KidCalFermata stop) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public KidConfig saveReturn(KidCalRitiro ritiro) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Teacher saveOrUpdateTeacher(String appId, String schoolId, Teacher teacher) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public KidCalNote saveNote(KidCalNote note) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public void saveMultimediaEntry(MultimediaEntry multimediaEntry) {
                // TODO Auto-generated method stub

            }

            @Override
            public InternalNote saveInternalNote(InternalNote comm) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public void saveDiaryEntry(DiaryEntry diary) {
                // TODO Auto-generated method stub

            }

            @Override
            public KidConfig saveConfig(KidConfig config) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Communication saveCommunication(Communication comm) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public ChatMessage saveChatMessage(ChatMessage message) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public KidConfig saveAbsence(KidCalAssenza absence) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public ChatMessage removeChatMessage(String appId, String schoolId, String messageId) {
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
            public List<DayDefault> getWeekDefault(String appId, String schoolId, String kidId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Long getUnreadChatMessageCount(String appId, String schoolId, String kidId,
                    String sender) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public LoginData getTokenDataByPersonId(String personId, String appId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public LoginData getTokenData(String username) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<Teacher> getTeachers(String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<TeacherCalendar> getTeacherCalendar(String appId, String schoolId,
                    long from, long to) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Teacher getTeacherByTeacherId(String teacherId, String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Teacher getTeacherByPin(String pin, String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Author getTeacherAsParent(String appId, String schoolId, String userId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Author getTeacherAsAuthor(String appId, String schoolId, String teacherId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Teacher getTeacher(String username, String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<KidCalFermata> getStop(String appId, String schoolId, String kidId,
                    long dateFrom, long dateTo) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public KidCalFermata getStop(String appId, String schoolId, String kidId, long date) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<SectionData> getSections(String appId, String schoolId,
                    Collection<String> sections, long date) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public SchoolProfile getSchoolProfileForUser(String appId, String username) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public SchoolProfile getSchoolProfile(String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<KidCalRitiro> getReturn(String appId, String schoolId, String kidId,
                    long dateFrom, long dateTo) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public KidCalRitiro getReturn(String appId, String schoolId, String kidId, long date) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Parent getParent(String username, String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public MultimediaEntry getMultimediaEntry(String appId, String schoolId, String kidId,
                    String multimediaId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<MultimediaEntry> getMultimediaEntries(String appId, String schoolId,
                    String kidId, Integer skip, Integer pageSize, Long from, Long to) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<Menu> getMeals(String appId, String schoolId, long from, long to) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<KidProfile> getKidProfilesByTeacher(String appId, String username) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<KidProfile> getKidProfilesBySchool(String appId, String schoolId) {
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
            public KidProfile getKidProfile(String appId, String schoolId, String kidId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public KidConfig getKidConfig(String appId, String schoolId, String kidId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<Communication> getKidCommunications(String appId, String schoolId,
                    String kidId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<KidCalNote> getKidCalNotesForSection(String appId, String schoolId,
                    String[] sectionIds, long date) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<KidCalNote> getKidCalNotes(String appId, String schoolId, String kidId,
                    long date) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<InternalNote> getInternalNotes(String appId, String schoolId,
                    String[] sectionIds, long date) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<GroupDTO> getGroupsDataBySchool(String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public GroupDTO getGroupData(String appId, String schoolId, String groupId) {
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
            public DiaryKid getDiaryKid(String appId, String schoolId, String kidId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public DiaryEntry getDiaryEntry(String appId, String schoolId, String kidId,
                    String entryId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<DiaryEntry> getDiary(String appId, String schoolId, String kidId,
                    String search, Integer skip, Integer pageSize, Long from, Long to, String tag) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<Communication> getCommunications(String appId, String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Communication getCommunicationById(String appId, String schoolId, String id) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<ChatMessage> getChatMessages(String appId, String schoolId, String kidId,
                    long timestamp, int limit) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<CalendarItem> getCalendar(String appId, String schoolId, String kidId,
                    long from, long to) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public BusData getBusData(String appId, String schoolId, long date) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public App getApp(String appId) {
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
            public KidCalAssenza getAbsence(String appId, String schoolId, String kidId,
                    long date) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public List<UsageEntity> findUsageEntities(String appId, String schoolId,
                    UsageAction action, UsageActor from, UsageActor to, Object extra, Long fromTime,
                    Long toTime) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public Teacher deleteTeacherByTeacherId(String teacherId, String appId,
                    String schoolId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public void deleteDiaryEntry(String appId, String schoolId, String kidId,
                    String entryId) {
                // TODO Auto-generated method stub

            }

            @Override
            public void deleteCommunication(String appId, String schoolId, String commId) {
                // TODO Auto-generated method stub

            }

            @Override
            public void createApp(AppInfo info) {
                // TODO Auto-generated method stub

            }

            @Override
            public long countUsageEntities(String appId, String schoolId, UsageAction action,
                    UsageActor from, UsageActor to, Object extra, Long fromTime, Long toTime) {
                // TODO Auto-generated method stub
                return 0;
            }

            @Override
            public void cleanImages(String appId, String schoolId, String kidId, String entryId,
                    Set<String> oldPics) {
                // TODO Auto-generated method stub

            }

            @Override
            public void cleanImages(String appId, String schoolId, String kidId, String entryId) {
                // TODO Auto-generated method stub

            }

            @Override
            public ChatMessage chatMessageSeen(String appId, String schoolId, String messageId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public ChatMessage chatMessageReceived(String appId, String schoolId,
                    String messageId) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public SchoolProfile getSchoolProfileByName(String appId, String name) {
                // TODO Auto-generated method stub
                return null;
            }

            @Override
            public KidProfile saveKidProfile(KidProfile kidProfile) {
                // TODO Auto-generated method stub
                return null;
            }
        };
    }


}