package it.smartcommunitylab.ungiorno.importer;

import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.hamcrest.Matchers;
import org.joda.time.LocalDate;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.AnnotationConfigWebContextLoader;
import org.springframework.test.context.web.WebAppConfiguration;

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
import it.smartcommunitylab.ungiorno.test_config.TestAppConfig;
import it.smartcommunitylab.ungiorno.usage.UsageEntity;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageActor;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TestAppConfig.class},
        loader = AnnotationConfigWebContextLoader.class)
@WebAppConfiguration
public class ImportDataTest {

    @Autowired
    private MongoTemplate mongo;

    @Before
    public void clean() {
        mongo.getDb().dropDatabase();
    }

    @Test
    public void issueBirthdateFromExcel() throws Exception {
        InputStream sourceInput = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream("sample-data.xlsx");
        List<KidProfile> kids =
                ImportData.readChildren(sourceInput, "TEST-APP", new FakeRepository());
        Assert.assertThat(kids, Matchers.hasSize(9));
        LocalDate birth = LocalDate.parse("2013-09-20");
        Assert.assertThat(kids.get(0).getBirthDate(), Matchers.is(birth.toDate()));
        birth = LocalDate.parse("2012-08-11");
        Assert.assertThat(kids.get(1).getBirthDate(), Matchers.is(birth.toDate()));
        birth = LocalDate.parse("2014-03-18");
        Assert.assertThat(kids.get(2).getBirthDate(), Matchers.is(birth.toDate()));
    }

    private class FakeRepository implements RepositoryService {

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
            SchoolProfile fakeSchool = new SchoolProfile();
            fakeSchool.setSchoolId("scuola");
            return fakeSchool;
        }

        @Override
        public SchoolProfile getSchoolProfileByName(String appId, String name) {
            SchoolProfile fakeSchool = new SchoolProfile();
            fakeSchool.setSchoolId("scuola");
            return fakeSchool;
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
        public List<CalendarItem> getCalendar(String appId, String schoolId, String kidId,
                long from, long to) {
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
        public KidConfig saveConfig(KidConfig config) {
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
        public KidConfig saveStop(KidCalFermata stop) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public KidCalFermata getStop(String appId, String schoolId, String kidId, long date) {
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
        public KidCalAssenza getAbsence(String appId, String schoolId, String kidId, long date) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public KidCalRitiro getReturn(String appId, String schoolId, String kidId, long date) {
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
        public KidConfig saveAbsence(KidCalAssenza absence) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public KidConfig saveReturn(KidCalRitiro ritiro) {
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
        public List<KidCalNote> getKidCalNotesForSection(String appId, String schoolId,
                String[] sectionIds, long date) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public KidCalNote saveNote(KidCalNote note) {
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
        public List<Communication> getKidCommunications(String appId, String schoolId,
                String kidId) {
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
        public InternalNote saveInternalNote(InternalNote comm) {
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
        public List<Menu> getMeals(String appId, String schoolId, long from, long to) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public BusData getBusData(String appId, String schoolId, long date) {
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
        public List<TeacherCalendar> getTeacherCalendar(String appId, String schoolId, long from,
                long to) {
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
        public DiaryEntry getDiaryEntry(String appId, String schoolId, String kidId,
                String entryId) {
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
        public void sortNotes(List<Note> notes) {
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
        public List<MultimediaEntry> getMultimediaEntries(String appId, String schoolId,
                String kidId, Integer skip, Integer pageSize, Long from, Long to) {
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

        @Override
        public List<UsageEntity> findUsageEntities(String appId, String schoolId,
                UsageAction action, UsageActor from, UsageActor to, Object extra, Long fromTime,
                Long toTime) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public long countUsageEntities(String appId, String schoolId, UsageAction action,
                UsageActor from, UsageActor to, Object extra, Long fromTime, Long toTime) {
            // TODO Auto-generated method stub
            return 0;
        }

    }
}
