package it.smartcommunitylab.ungiorno.usage;

import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageActor;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@Component
public class UsageManager {

	@Autowired
	private RepositoryManager repository;
	
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
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.MESSAGE, UsageActor.PARENT, null, "", null, null), schoolId, typeCount.get(1));
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.MESSAGE, UsageActor.TEACHER, null, "", null, null), schoolId, typeCount.get(2));		
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.ABSENCE, null, null, null, null, null), schoolId, typeCount.get(3));
		countByQuery(repository.findUsageEntities(appId, schoolId, UsageAction.RETURN, null, null, null, null, null), schoolId, typeCount.get(4));		
		
		getDates(typeCount).stream().forEach(x -> sb.append(csvLine(x, typeCount)));
		
		return sb.toString();
	}	
	
	private void countByQuery(List<UsageEntity> result, String schoolId, Map<String, Integer> countByTimestamp) {
		result.stream().collect(Collectors.groupingBy(x -> sdf.format(new Date(x.getTimestamp())))).
		forEach((k,v) ->
		countByTimestamp.put(k, v.size()));
	}	
	
	private Set<String> getDates(List<Map<String, Integer>> typeCount) {
		Set<String> dates = Sets.newTreeSet();
		typeCount.stream().forEach(x -> dates.addAll(x.keySet()));
		return dates;
	}
	
	
	private String csvLine(String date, List<Map<String, Integer>> typeCount) {
		StringBuffer sb = new StringBuffer();
		sb.append(date + ",");
		typeCount.stream().forEach(x -> sb.append(x.getOrDefault(date, 0) + ","));
		sb.deleteCharAt(sb.length() - 1);
		sb.append("\r\n");
		return sb.toString();
	}
	
}
