/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.importer;

import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import org.apache.poi.hssf.extractor.ExcelExtractor;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.util.StringUtils;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Sets;

import it.smartcommunitylab.ungiorno.diary.model.DiaryTeacher;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.BusService;
import it.smartcommunitylab.ungiorno.model.Contact;
import it.smartcommunitylab.ungiorno.model.KidBusData;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.KidProfile.Allergy;
import it.smartcommunitylab.ungiorno.model.KidServices;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile.BusProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile.SectionProfile;
import it.smartcommunitylab.ungiorno.model.SchoolService;
import it.smartcommunitylab.ungiorno.model.SectionDef;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TypeDef;

/**
 * @author raman
 *
 */
public class Importer {
	private static final String SHEET_ALLERGIE = "ALLERGIE";
	private static final String SHEET_DELEGHE = "DELEGHE";
	private static final String SHEET_UTENTI = "UTENTI";
	private static final String SHEET_CIBI = "CIBI";
	private static final String SHEET_TIPOLOGIE_NOTE = "TIPOLOGIE_NOTE";
	private static final String SHEET_MALATTIE = "MALATTIE";
	private static final String SHEET_ASSENZE = "ASSENZE";
	private static final String SHEET_PROFILO = "PROFILO";
	private static final String SHEET_BUS = "BUS";
	private static final String SHEET_SEZIONI = "SEZIONI";
	private static final String SHEET_INSEGNANTI = "INSEGNANTI";

	private static final Set<String> expectedSchoolSheets = Sets.newHashSet(SHEET_PROFILO,SHEET_ASSENZE,SHEET_MALATTIE,SHEET_TIPOLOGIE_NOTE,SHEET_SEZIONI, SHEET_CIBI,SHEET_BUS,SHEET_INSEGNANTI);
	private static final Set<String> expectedKidSheets = Sets.newHashSet(SHEET_PROFILO,SHEET_UTENTI,SHEET_DELEGHE,SHEET_ALLERGIE,SHEET_BUS,SHEET_INSEGNANTI);
//	private static final Set<String> expectedSchoolSheets = Sets.newHashSet(SHEET_PROFILO,SHEET_ASSENZE,SHEET_MALATTIE,SHEET_SEZIONI,SHEET_BUS,SHEET_INSEGNANTI);
//	private static final Set<String> expectedKidSheets = Sets.newHashSet(SHEET_PROFILO,SHEET_UTENTI,SHEET_DELEGHE,SHEET_ALLERGIE,SHEET_BUS);
	
	private static final Set<String> numFields = Sets.newHashSet("PIN","CAPACITA");
	static
	
	private SchoolProfile schoolProfile = null;
	private List<Teacher> teachers = new ArrayList<Teacher>();
	private List<KidProfile> children = new ArrayList<KidProfile>();
	private List<Parent> parents = new ArrayList<Parent>();
	
	private List<KidBusData> busData = new ArrayList<KidBusData>();
	
	//private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("dd/MM/yyyy");
	private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");
	private static final SimpleDateFormat TIME_FORMAT = new SimpleDateFormat("HH:mm");
	
	public void importChildrenData(String appId, String schoolId, InputStream is) throws ImportError {
		try {
			HSSFWorkbook wb = readFile(is, expectedKidSheets);
			children.clear();
			parents.clear();
			busData.clear();
			mapChildrenData(appId, schoolId, wb);
			
		} catch (Exception e) {
			throw new ImportError(e.getMessage());
		}
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param wb
	 * @throws ImportError 
	 */
	private void mapChildrenData(String appId, String schoolId, HSSFWorkbook wb) throws ImportError {
		Map<String, KidProfile> kidMap = null;
		for (int i = 0; i < wb.getNumberOfSheets(); i++) {
			Sheet sheet = wb.getSheetAt(i);
			List<Map<String, String>> result = getSheetMap(sheet);
			if (SHEET_PROFILO.equals(sheet.getSheetName())) {
				kidMap = parseKidProfiles(appId, schoolId, result);
			}
			if (SHEET_UTENTI.equals(sheet.getSheetName())) {
				parseUsers(appId, schoolId, result, kidMap);
			}
			if (SHEET_DELEGHE.equals(sheet.getSheetName())) {
				parseDeleghe(appId, schoolId, result, kidMap);
			}
			if (SHEET_ALLERGIE.equals(sheet.getSheetName())) {
				parseAllergie(appId, schoolId, result, kidMap);
			}
			if (SHEET_BUS.equals(sheet.getSheetName())) {
				parseKidBus(appId, schoolId, result, kidMap);
			}
			if (SHEET_INSEGNANTI.equals(sheet.getSheetName())) {
				parseInsegnanti(appId, schoolId, result, kidMap);
			}			
			
		}	
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param result
	 * @param kidMap
	 * @throws ImportError 
	 */
	private void parseKidBus(String appId, String schoolId, List<Map<String, String>> result, Map<String, KidProfile> kidMap) throws ImportError {
		for (Map<String,String> m : result) {
			KidBusData data = new KidBusData();
			data.setAppId(appId);
			data.setSchoolId(schoolId);
			String kidId = m.get("IDBAMBINO");
			if (!kidMap.containsKey(kidId)) {
				throw new ImportError("Unknown kidId for kid-bus mapping: "+kidId);
			}
			data.setKidId(kidId);
			data.setStopId(kidMap.get(kidId).getServices().getBus().getStops().get(0).getStopId());
			data.setBusId(m.get("BUS"));
			data.setPersonId(m.get("PERSON"));
			busData.add(data);
		}
		
	}
	
	/**
	 * @param appId
	 * @param schoolId
	 * @param result
	 * @param kidMap
	 * @throws ImportError 
	 */
	private void parseInsegnanti(String appId, String schoolId, List<Map<String, String>> result, Map<String, KidProfile> kidMap) throws ImportError {
		for (Map<String,String> m : result) {
			String kidId = m.get("IDBAMBINO");
			String teacherId = m.get("IDINSEGNANTE");
			boolean primary = "X".equals(m.get("PRIMARIA"));
			DiaryTeacher dt = new DiaryTeacher();
			dt.setTeacherId(teacherId);
			dt.setPrimary(primary);
			kidMap.get(kidId).getDiaryTeachers().add(dt);
		}
		
	}	
	
	
	/**
	 * @param appId
	 * @param schoolId
	 * @param result
	 * @param kidMap
	 */
	private void parseAllergie(String appId, String schoolId, List<Map<String, String>> result, Map<String, KidProfile> kidMap) {
		for (Map<String,String> m : result) {
			String kidId = m.get("IDBAMBINO");
			if (kidMap.containsKey(kidId)) {
				Allergy a = new Allergy();
				a.setName(m.get("NOME"));
				a.setType(m.get("TIPO"));
				kidMap.get(kidId).getAllergies().add(a);
			}
		}
		
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param result
	 * @param kidMap
	 * @throws ImportError 
	 */
	private void parseDeleghe(String appId, String schoolId, List<Map<String, String>> result, Map<String, KidProfile> kidMap) throws ImportError {
		for (Map<String,String> m : result) {
			AuthPerson p = new AuthPerson();
			p.setPersonId(m.get("ID"));
			p.setFirstName(m.get("NOME"));
			p.setLastName(m.get("COGNOME"));
			p.setFullName(p.getFirstName() + " " + p.getLastName());
			p.setEmail(Arrays.asList(StringUtils.commaDelimitedListToStringArray(m.get("EMAIL"))));
			p.setPhone(Arrays.asList(StringUtils.commaDelimitedListToStringArray(m.get("TELEFONO"))));
			p.setRelation(m.get("LEGAME"));
			p.setAdult(m.get("ADULTO").equals("1"));
			try {
				p.setAuthorizationDeadline(DATE_FORMAT.parse(m.get("SCADENZA_DELEGA")).getTime());
			} catch (ParseException e) {
				throw new ImportError("Delega date format error: "+ e.getMessage());
			}
			String kidId = m.get("IDBAMBINO");
			if (kidMap.containsKey(kidId)) {
				kidMap.get(kidId).getPersons().add(p);
			}
		}
		
	}

	/**
	 * @param appId
	 * @param schoolId
	 * @param result
	 * @param kidMap
	 */
	private void parseUsers(String appId, String schoolId, List<Map<String, String>> result, Map<String, KidProfile> kidMap) {
		Multimap<String, AuthPerson> parentToPersons = ArrayListMultimap.create();
		for (String kidId : kidMap.keySet()) {
			KidProfile kid = kidMap.get(kidId);
			for (AuthPerson ap: kid.getPersons()) {
				if (ap.isParent()) {
					parentToPersons.put(ap.getPersonId(), ap);
				}
			}
		}
		
		for (Map<String,String> m : result) {
			Parent p = new Parent();
			p.setPersonId(m.get("ID"));
			p.setFirstName(m.get("NOME"));
			p.setLastName(m.get("COGNOME"));
			p.setFullName(p.getFirstName() + " " + p.getLastName());
			p.setAppId(appId);
			p.setEmail(Arrays.asList(StringUtils.commaDelimitedListToStringArray(m.get("EMAIL"))));
			p.setUsername(m.get("USERNAME"));
			p.setPhone(Arrays.asList(StringUtils.commaDelimitedListToStringArray(m.get("TELEFONO"))));
			parents.add(p);
			
			Collection<AuthPerson> personsOfKids = parentToPersons.get(p.getPersonId());
			for (AuthPerson person : personsOfKids) {
				person.setAdult(true);
				person.setEmail(p.getEmail());
				person.setFirstName(p.getFirstName());
				person.setFullName(p.getFullName());
				person.setLastName(p.getLastName());
				person.setPhone(p.getPhone());
			}
		}
	}

	/**
	 * @param schoolId 
	 * @param appId 
	 * @param result
	 */
	private Map<String,KidProfile> parseKidProfiles(String appId, String schoolId, List<Map<String, String>> result) {
		Map<String,KidProfile> output = new HashMap<String, KidProfile>();
		for (Map<String,String> map : result) {
			KidProfile p = new KidProfile();
			p.setAppId(appId);
			p.setSchoolId(schoolId);
			p.setFirstName(map.get("NOME"));
			p.setLastName(map.get("COGNOME"));
			p.setFullName(p.getFirstName() + " " + p.getLastName());
			p.setImage(map.get("IMMAGINE"));
			p.setKidId(map.get("ID"));
			p.setSharedDiary("X".equals(map.get("DIARIO_CONDIVISO")));
			List<AuthPerson> parents = new ArrayList<AuthPerson>();
			parents.add(new AuthPerson(map.get("GENITORE1"), map.get("GENITORE1_RELATION"),true));
			if (map.containsKey("GENITORE2") && StringUtils.hasText(map.get("GENITORE2"))) {
				parents.add(new AuthPerson(map.get("GENITORE2"), map.get("GENITORE2_RELATION"),false));
			}
			p.setPersons(parents);
			SectionDef section = new SectionDef();
			section.setSectionId(map.get("SEZIONE"));
			p.setSection(section);
			KidServices services = new KidServices();
			services.setAnticipo(new SchoolService(map.get("ANTICIPO").equals("1")));
			services.setPosticipo(new SchoolService(map.get("POSTICIPO").equals("1")));
			services.setBus(new BusService(map.get("BUS").equals("1"),map.get("FERMATA")));
			services.setMensa(new SchoolService(map.get("MENSA").equals("1")));
			p.setServices(services);
			
			children.add(p);
			output.put(p.getKidId(), p);
		}
		return output;
	}

	public void importSchoolData(String appId, String schoolId, InputStream is) throws ImportError {
		
		try {
			HSSFWorkbook wb = readFile(is, expectedSchoolSheets);
			schoolProfile = new SchoolProfile();
			schoolProfile.setAppId(appId);
			schoolProfile.setSchoolId(schoolId);
			
			mapSchoolData(appId, schoolId, wb);
		} catch (IOException e) {
			e.printStackTrace();
			throw new ImportError(e.getMessage());
		}
	}

	private HSSFWorkbook readFile(InputStream inp, Set<String> expected) throws IOException, ImportError {
		
		HSSFWorkbook wb = new HSSFWorkbook(new POIFSFileSystem(inp));
		ExcelExtractor extractor = new ExcelExtractor(wb);

		extractor.setFormulasNotResults(true);
		extractor.setIncludeSheetNames(false);

		Set<String> sheetNames = Sets.newHashSet();
		for (int i = 0; i < wb.getNumberOfSheets(); i++) {
			sheetNames.add(wb.getSheetAt(i).getSheetName());
		}
		
		Set<String> missingExpected = new HashSet<String>(expected);
		missingExpected.removeAll(sheetNames);
		
		Set<String> additionalFound = Sets.newHashSet(sheetNames);
		additionalFound.removeAll(expected);		
		
		if (!missingExpected.isEmpty() || !additionalFound.isEmpty()) {
			System.err.println("Missing sheet(s) expected: " + missingExpected + " - Additional sheet(s) found: " + additionalFound);
			throw new ImportError(Lists.newArrayList("Missing sheet(s) expected: " + missingExpected, "Additional sheet(s) found: " + additionalFound));
		}
		return wb;
	}
	

	/**
	 * @param wb
	 * @param schoolProfile
	 * @param teachers
	 */
	private void mapSchoolData(String appId, String schoolId, HSSFWorkbook wb) {
		for (int i = 0; i < wb.getNumberOfSheets(); i++) {
			Sheet sheet = wb.getSheetAt(i);
			{
				List<Map<String, String>> result = getSheetMap(sheet);
				if (SHEET_PROFILO.equals(sheet.getSheetName())) {
					parseProfile(schoolProfile, result);
				}
				if (SHEET_ASSENZE.equals(sheet.getSheetName())) {
					 List<TypeDef> types = parseTypes(result);
					 schoolProfile.setAbsenceTypes(types); 
				}
				if (SHEET_MALATTIE.equals(sheet.getSheetName())) {
					 List<TypeDef> types = parseTypes(result);
					 schoolProfile.setFrequentIllnesses(types); 
				}
				if (SHEET_TIPOLOGIE_NOTE.equals(sheet.getSheetName())) {
					 List<TypeDef> types = parseTypes(result);
					 schoolProfile.setTeacherNoteTypes(types); 
				}
				if (SHEET_CIBI.equals(sheet.getSheetName())) {
					 List<TypeDef> types = parseTypes(result);
					 schoolProfile.setFoodTypes(types); 
				}
				if (SHEET_BUS.equals(sheet.getSheetName())) {
					 schoolProfile.setBuses(parseBuses(result)); 
				}
				if (SHEET_SEZIONI.equals(sheet.getSheetName())) {
					 schoolProfile.setSections(parseSections(result)); 
				}
				if (SHEET_INSEGNANTI.equals(sheet.getSheetName())) {
					parseTeachers(appId, schoolId, result);
				}
			}
		}
	}

	/**
	 * @param result
	 * @param teachers
	 */
	private void parseTeachers(String appId, String schoolId, List<Map<String, String>> result) {
		teachers.clear();
		for (Map<String,String> map : result) {
			Teacher t = new Teacher();
			t.setAppId(appId);
			t.setSchoolId(schoolId);
			t.setSectionIds(Arrays.asList(StringUtils.commaDelimitedListToStringArray(map.get("SEZIONI"))));
			t.setColorToDisplay(map.get("COLOR"));
			t.setTeacherName(map.get("NOME"));
			t.setTeacherSurname(map.get("COGNOME"));
			t.setTeacherFullname(t.getTeacherName() +" "+t.getTeacherSurname());
			t.setTeacherId(map.get("ID"));
			t.setUsername(map.get("USERNAME"));
			t.setPin(map.get("PIN"));
			teachers.add(t);
		}
	}

	/**
	 * @param result
	 * @return
	 */
	private List<SectionProfile> parseSections(List<Map<String, String>> result) {
		List<SectionProfile> sections = new ArrayList<SectionProfile>();
		for (Map<String,String> map : result) {
			SectionProfile def = new SectionProfile();
			def.setSectionId(map.get("ID"));
			def.setName(map.get("NOME"));
			sections.add(def);
		}
		return sections;
	}

	/**
	 * @param result
	 * @return
	 */
	private List<BusProfile> parseBuses(List<Map<String, String>> result) {
		List<BusProfile> buses = new ArrayList<BusProfile>();
		for (Map<String,String> map : result) {
			BusProfile def = new BusProfile();
			def.setBusId(map.get("ID"));
			def.setName(map.get("NOME"));
			def.setCapacity(Integer.parseInt(map.get("CAPACITA")));
			buses.add(def);
		}
		return buses;
	}

	/**
	 * @param schoolProfile
	 * @param result
	 */
	private List<TypeDef> parseTypes(List<Map<String, String>> result) {
		List<TypeDef> types = new ArrayList<TypeDef>();
		for (Map<String,String> map : result) {
			TypeDef def = new TypeDef();
			def.setTypeId(map.get("TIPO"));
			def.setType(map.get("NOME"));
			types.add(def);
		}
		
		return types;
	}

	private void parseProfile(SchoolProfile schoolProfile, List<Map<String, String>> result) {
		Map<String,String> line = result.get(0);

		SchoolProfile.Timing timing = new SchoolProfile.Timing();
		timing.setFromTime(line.get("DA"));
		timing.setToTime(line.get("A"));
		schoolProfile.setRegularTiming(timing);
		
		timing = new SchoolProfile.Timing();
		timing.setFromTime(line.get("ANTICIPO"));
		timing.setToTime(line.get("DA"));
		schoolProfile.setAnticipoTiming(timing);

		timing = new SchoolProfile.Timing();
		timing.setToTime(line.get("POSTICIPO"));
		timing.setFromTime(line.get("A"));
		schoolProfile.setPosticipoTiming(timing);
		
		schoolProfile.setContacts(new Contact());
		schoolProfile.getContacts().setTelephone(
				Arrays.asList(StringUtils.commaDelimitedListToStringArray(line.get("PHONE"))));
		schoolProfile.getContacts().setEmail(
				Arrays.asList(StringUtils.commaDelimitedListToStringArray(line.get("EMAIL"))));
		
		schoolProfile.setAbsenceTiming(line.get("ORARIO_ASSENZA"));
		schoolProfile.setRetireTiming(line.get("ORARIO_RITIRO"));
		schoolProfile.setAccessEmail(line.get("ACCESS_EMAIL"));

	}

	private List<Map<String, String>> getSheetMap(Sheet sheet) {
		System.err.println(sheet.getSheetName());
		Row row = sheet.getRow(0);
		List<String> keys = new ArrayList<String>();
		int firstRow = 1;
		if (row.getLastCellNum() != 1) {
			for (int j = 0; j < row.getLastCellNum(); j++) {
				String key = getCellValue(row.getCell(j), null).toUpperCase().replace(' ', '_').trim();
				keys.add(key);
			}
		} else {
			firstRow = 1;
			keys.add("valore");
		}

		List<Map<String, String>> result = new ArrayList<Map<String, String>>();
		for (int i = firstRow; i <= sheet.getLastRowNum(); i++) {
			row = sheet.getRow(i);
			if (row == null) {
				continue;
			}
			Map<String, String> map = new TreeMap<String, String>();
			boolean add = false;
			for (int j = 0; j < row.getLastCellNum(); j++) {
				if (j >= keys.size()) {
					continue;
				}
				if (row.getCell(j) != null) {
					String value = getCellValue(row.getCell(j), keys.get(j)).replace("_", " ").trim();
					if (!value.isEmpty()) {
						add = true;
					}
					try {
						map.put(keys.get(j), value);
					} catch (Exception e) {
						e.printStackTrace();
					}
				} else {
					map.put(keys.get(j), "");
				}
			}
			if (add) {
				result.add(map);
			}
		}

		return result;
	}

	private String getCellValue(Cell cell, String key) {
		switch (cell.getCellType()) {
		case Cell.CELL_TYPE_STRING:
			return cell.getStringCellValue();
		case Cell.CELL_TYPE_NUMERIC:
			if (key != null && numFields.contains(key.toUpperCase())) {
				double v = cell.getNumericCellValue();
				if (v - Math.floor(v) > 0) return ""+v;
				return ""+Math.round(v);
			}
			
			Date date = cell.getDateCellValue();
			Calendar cal = Calendar.getInstance();
			cal.setTime(date);
			if (cal.get(Calendar.YEAR) <= 1970) return TIME_FORMAT.format(date);
			return DATE_FORMAT.format(date);
						
			// TODO revise date management
//			String value = null;
//			Calendar cal = new GregorianCalendar();
//			cal.setTime(cell.getDateCellValue());
//			if (cal.get(Calendar.YEAR) < 2014) {
//				value = cal.get(Calendar.HOUR_OF_DAY) + ":" + (cal.get(Calendar.MINUTE) + "0").substring(0, 2);
//			} else {
//				String month = "0" + (1 + cal.get(Calendar.MONTH));
//				String day = "0" + cal.get(Calendar.DAY_OF_MONTH);
//				value = cal.get(Calendar.YEAR) + "-" + month.substring(month.length() - 2, month.length()) + "-" + day.substring(day.length() - 2, day.length());
//			}
//			return value;
		}
		return "";
	}

	/**
	 * @return
	 */
	public SchoolProfile getSchoolProfile() {
		return schoolProfile;
	}

	/**
	 * @return
	 */
	public List<Teacher> getTeachers() {
		return teachers;
	}

	public List<KidProfile> getChildren() {
		return children;
	}

	public List<Parent> getParents() {
		return parents;
	}

	public List<KidBusData> getBusData() {
		return busData;
	}

	
}
