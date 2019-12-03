package it.smartcommunitylab.ungiorno.importer;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.services.impl.KidManager;
import it.smartcommunitylab.ungiorno.utils.Utils;

@Component
public class ImportData {
    private static final transient Logger logger = LoggerFactory.getLogger(ImportData.class);

    @Autowired
    private RepositoryService storage;
    @Autowired
    private KidManager kidManager;
    
    public void importData(InputStream is, String appId, String schoolId) throws ImportError {
    	List<KidProfile> children = readChildren(is, appId, schoolId);
    	processChildren(children, appId, schoolId);
    }
    
    private List<KidProfile> readChildren(InputStream excel, String appId, String schoolId) throws ImportError {
    	List<String> errors = new LinkedList<>();
        Map<String, KidProfile> result = new LinkedHashMap<String, KidProfile>();
        if (logger.isInfoEnabled()) {
            logger.info("readChildren:start import");
        }
        XSSFWorkbook wb = null;
        try {
            wb = new XSSFWorkbook(excel);
            XSSFSheet sheet = wb.getSheetAt(0);
            if (sheet == null) {
                throw new ImportError("data sheet not found");
            }
            DataFormatter fmt = new DataFormatter();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || row.getLastCellNum() < 9) continue;
                
                String cognomeGen = row.getCell(0).getStringCellValue();
                String nomeGen = row.getCell(1).getStringCellValue();
                String cfGen = row.getCell(2).getStringCellValue().toUpperCase();
                String telGen = fmt.formatCellValue(row.getCell(3, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK));
                String cognomeAlunno = row.getCell(4).getStringCellValue();
                String nomeAlunno = row.getCell(5).getStringCellValue();
                Date dataAlunno = row.getCell(6).getDateCellValue();
                String cfAlunno = row.getCell(7).getStringCellValue().toUpperCase();
                String sessoAlunno = row.getCell(8).getStringCellValue();
                String scuolaAlunno = row.getCell(9).getStringCellValue();
                // String iscrizioneAlunno = row.getCell(10).getStringCellValue();

                if (logger.isInfoEnabled()) {
                    logger.info("read kid:" + cfAlunno);
                }
                if (schoolId != null && !schoolId.equals(scuolaAlunno)) continue;
                
                SchoolProfile schoolProfile = storage.getSchoolProfileByName(appId, scuolaAlunno);
                if (schoolProfile == null) {
                	errors.add("School not found:" + scuolaAlunno);
                	logger.error(errors.get(errors.size()-1));
                    continue;
                }
                if (schoolId != null && !schoolProfile.getSchoolId().equals(schoolId)) {
                	errors.add("School does not match:" + scuolaAlunno);
                	logger.error(errors.get(errors.size()-1));
                    continue;
                }

                KidProfile kid = result.get(cfAlunno);
                if (kid == null) {
                    kid = new KidProfile();
                    kid.setAppId(appId);
                    kid.setKidId(cfAlunno);
                    kid.setFullName(nomeAlunno + " " + cognomeAlunno);
                    kid.setFirstName(nomeAlunno);
                    kid.setLastName(cognomeAlunno);
                    kid.setBirthDate(dataAlunno);
                    kid.setGender(getGender(sessoAlunno));
                    kid.setSchoolId(schoolProfile.getSchoolId());
                    kid.setPersons(new ArrayList<AuthPerson>());
                    result.put(cfAlunno, kid);
                }

                AuthPerson person = new AuthPerson();
                person.setPersonId(cfGen);
                person.setFullName(nomeGen + " " + cognomeGen);
                person.setFirstName(nomeGen);
                person.setLastName(cognomeGen);
                if (Utils.isNotEmpty(telGen)) {
                    person.setPhone(extractPhones(telGen));
                }
                person.setParent(true);
                person.setAdult(true);
                kid.getPersons().add(person);
            }
        } catch (Exception e) {
        	e.printStackTrace();
            throw new ImportError(e.getMessage());
        } finally {
            if (wb != null)
				try {
					wb.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
        }
        if (logger.isInfoEnabled()) {
            logger.info("readChildren:kids read " + result.values().size());
        }
        if (errors.size() > 0) throw new ImportError(errors);
        return new ArrayList<KidProfile>(result.values());
    }

    private void processChildren(List<KidProfile> children, String appId, String schoolId) {
    	Map<String, Set<String>> existing = new HashMap<>();
    	Map<String, List<KidProfile>> newOrUpdate = new HashMap<>();
    	if (schoolId == null) {
    		Set<String> newSchools = new HashSet<>();
    		for (KidProfile c : children) {
    			newSchools.add(c.getSchoolId());
    		} 
    		
    		List<School> schools = storage.getApp(appId).getAppInfo().getSchools();
    		for (School school: schools) {
    			if (!newSchools.contains(school.getSchoolId())) continue;
    			
    			List<KidProfile> kids = storage.getKidProfilesBySchool(appId, school.getSchoolId());
    			Set<String> set = new HashSet<String>();
    			existing.put(school.getSchoolId(), set);
    			for (KidProfile kid: kids) {
    				set.add(kid.getKidId());
    			}
    			newOrUpdate.put(school.getSchoolId(), new LinkedList<KidProfile>());
    		}
    	} else {
			List<KidProfile> kids = storage.getKidProfilesBySchool(appId, schoolId);
			Set<String> set = new HashSet<String>();
			existing.put(schoolId, set);
			newOrUpdate.put(schoolId, new LinkedList<KidProfile>());
			for (KidProfile kid: kids) {
				set.add(kid.getKidId());
			}
    	}
    	
        for (KidProfile kid : children) {
        	if (!existing.containsKey(kid.getSchoolId())) continue;
        	
        	// skip existing ones
        	if (existing.get(kid.getSchoolId()).contains(kid.getKidId())) {
        		// remove from existing. what remains will be deleted
        		existing.get(kid.getSchoolId()).remove(kid.getKidId());
        		KidProfile old = storage.getKidProfile(appId, kid.getSchoolId(), kid.getKidId());
        		old.setDataState(KidProfile.DS_TOUPDATE);
        		newOrUpdate.get(kid.getSchoolId()).add(old);
        		continue;
        	}
        	kid.setDataState(KidProfile.DS_TOUPDATE);
        	newOrUpdate.get(kid.getSchoolId()).add(kid);
            kidManager.updateNewParentsOnly(kid);

            if (logger.isInfoEnabled()) {
                logger.info(String.format("add kid:%s", kid.getKidId()));
            }
        }
        // process schools
        for (String key : newOrUpdate.keySet()) {
            storage.updateChildren(appId, key, newOrUpdate.get(key));
        }
    }
    
    /**
	 * @param telGen
	 * @return
	 */
	private static List<String> extractPhones(String telGen) {
		String tel = telGen.replace("  ", "-").replace(" - ", "-").replace(" ", "-").replace("/", "").replace("+", "");
		String[] arr = tel.split("-");
		List<String> res = new LinkedList<>();
		int len =arr.length;
		for (int i = 0; i < len; i++) {
			String s = arr[i];
			if (s.length() < 5 && i < len - 1) {
				s += arr[i+1];
				i++;
			}
			res.add(s);
			System.err.println(s);;
		}
		
		return res;
	}

	public static String getGender(String sessoAlunno) {
        if (sessoAlunno.equals("M")) {
            return "Maschio";
        } else {
            return "Femmina";
        }
    }
}
