package it.smartcommunitylab.ungiorno.usage;

import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageActor;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Sets;

@Component
public class UsageManager {

	@Autowired
	private RepositoryService repository;
	
	private SimpleDateFormat osdf = new SimpleDateFormat("yy/MM/dd");
	private SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yy");
	
	public void messageSent(String appId, String schoolId, String fromId, String toId, UsageActor from, UsageActor to, boolean multi) {
		String type = multi?"Comunicazione":("Messaggio da " + (from.equals(UsageActor.TEACHER)?"insegnante":"genitore"));
		UsageEntity ue = new UsageEntity(type, from, to, fromId, toId, UsageAction.MESSAGE, multi?"multi":"", appId, schoolId);
		repository.saveUsageEntity(ue);
	}
	
	public void kidReturn(String appId, String schoolId, String fromId, boolean bus) {
		UsageEntity ue = new UsageEntity("Ritiro", UsageActor.PARENT, null, fromId, null, UsageAction.RETURN, bus?"bus":"", appId, schoolId);
		repository.saveUsageEntity(ue);
	}	
	
	public void kidAbsence(String appId, String schoolId, String fromId) {
		UsageEntity ue = new UsageEntity("Assenza", UsageActor.PARENT, null, fromId, null, UsageAction.ABSENCE, null, appId, schoolId);
		repository.saveUsageEntity(ue);
	}	
	
	public String generateCSV(String appId, String schoolId) {
		StringBuffer sb = new StringBuffer();
		
		sb.append("Data,Comunicazioni,Messaggi da insegnanti,Messaggi da genitori,Assenze,Ritiri\r\n");

		List<Map<String, Integer>> typeCount = Lists.newArrayList();
		for (int i = 0; i < 5; i++) {
			Map<String, Integer> tc = Maps.newTreeMap();
			typeCount.add(tc);
		}
		
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.MESSAGE, UsageActor.TEACHER, null, "multi", null, null), schoolId, typeCount.get(0));
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.MESSAGE, UsageActor.TEACHER, null, "", null, null), schoolId, typeCount.get(1));
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.MESSAGE, UsageActor.PARENT, null, "", null, null), schoolId, typeCount.get(2));
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.ABSENCE, null, null, null, null, null), schoolId, typeCount.get(3));
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.RETURN, null, null, null, null, null), schoolId, typeCount.get(4));		
		
		for (String d: getDates(typeCount)) {
			sb.append(csvLine(d, typeCount));
		}
		
//		getDates(typeCount).stream().forEach(x -> sb.append(csvLine(x, typeCount)));
		
		return sb.toString();
	}	

	private void countByQuery(List<UsageEntity> result, String schoolId, Map<String, Integer> countByTimestamp) {
		Multimap<String, UsageEntity> map = ArrayListMultimap.create();
		for (UsageEntity ue: result) {
			map.put(osdf.format(new Date(ue.getTimestamp())), ue);
		}
		for (String day: map.keySet()) {
			countByTimestamp.put(day, map.get(day).size());
		}
	}		
	
	
//	private void countByQuery(List<UsageEntity> result, String schoolId, Map<String, Integer> countByTimestamp) {
//		result.stream().collect(Collectors.groupingBy(x -> sdf.format(new Date(x.getTimestamp())))).
//		forEach((k,v) ->
//		countByTimestamp.put(k, v.size()));
//	}	
	
	private Set<String> getDates(List<Map<String, Integer>> typeCount) {
		Set<String> dates = Sets.newTreeSet();
		for (Map<String, Integer> map: typeCount) {
			dates.addAll(map.keySet());
		}
		
		List<String> dl = Lists.newArrayList(dates);
		Date start;
//		Date end = osdf.parse(dl.get(dl.size() - 1));
		Date end = new Date();
		try {
			start = osdf.parse(dl.get(0));

			Calendar cal = new GregorianCalendar();
			while (true) {
				cal.setTime(start);
				cal.add(Calendar.DAY_OF_YEAR, 1);
				start = cal.getTime();
				
				if (!start.before(end)) {
					break;
				}
				
				String day = osdf.format(start);
				if (!dates.contains(day)) {
					dates.add(day);
				}
			}

		} catch (ParseException e) {
		}
		
		System.out.println(dates);
		
		return dates;
	}	
	
//	private Set<String> getDates(List<Map<String, Integer>> typeCount) {
//		Set<String> dates = Sets.newTreeSet();
//		typeCount.stream().forEach(x -> dates.addAll(x.keySet()));
//		return dates;
//	}
	
	
	private String csvLine(String date, List<Map<String, Integer>> typeCount) {
		StringBuffer sb = new StringBuffer();
		try {
			sb.append(sdf.format(osdf.parse(date)) + ",");
		} catch (ParseException e) {
		}
		for (Map<String, Integer> map: typeCount) {
			if (map.containsKey(date)) {
				sb.append(map.get(date) + ",");
			} else {
				sb.append("0,");
			}
		}
		sb.deleteCharAt(sb.length() - 1);
		sb.append("\r\n");
		return sb.toString();
	}	
	
	
//	private String csvLine(String date, List<Map<String, Integer>> typeCount) {
//		StringBuffer sb = new StringBuffer();
//		sb.append(date + ",");
//		typeCount.stream().forEach(x -> sb.append(x.getOrDefault(date, 0) + ","));
//		sb.deleteCharAt(sb.length() - 1);
//		sb.append("\r\n");
//		return sb.toString();
//	}
	
	
	
	
	
	
	
}
