package eu.cloudopting.provision;

import org.json.JSONObject;


/**
 * Main interface for all provision components.
 */
public interface ProvisionComponent<Resp extends ProvisionResult,Req extends ProvisionRequest> {
    public Resp provision(Req request);

	public String provisionVM(Req request);

	public boolean checkVMdeployed(Req myRequest, String taskId);

	public JSONObject getVMinfo(Req myRequest, String taskId);

	public String acquireIp(Req myRequest);
	
	public boolean checkIpAcquired(Req myRequest, String taskId);

	public JSONObject getAcquiredIpinfo(Req myRequest, String taskId);

}
