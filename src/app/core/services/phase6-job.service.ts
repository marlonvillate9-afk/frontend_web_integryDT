import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, takeWhile, timer } from 'rxjs';

export interface DeviceRow { id:string; name:string; status:string; os:string; architecture:string; agentVersion:string; lastSeenAt:string|null; }
export interface JobRow { id:string; action:string; status:string; deviceName:string; toolCode:string; gadgetCode:string; version:string; resultJson?:string|null; stdout?:string|null; stderr?:string|null; }
export interface ArtifactRow { id:string; filename:string; contentType:string; sizeBytes:number; sha256:string; createdAt:string; expiresAt:string|null; }

@Injectable({providedIn:'root'})
export class Phase6JobService {
  private readonly http=inject(HttpClient);
  devices():Observable<DeviceRow[]>{ return this.http.get<DeviceRow[]>('/api/v1/devices'); }
  create(deviceId:string,toolCode:string,action:string,parameters:unknown):Observable<{id:string,status:string}>{ return this.http.post<{id:string,status:string}>('/api/v1/jobs',{deviceId,toolCode,action,parameters}); }
  watch(id:string):Observable<JobRow>{ return timer(0,600).pipe(switchMap(()=>this.http.get<JobRow>(`/api/v1/jobs/${id}`)),takeWhile(j=>!['success','error','cancelled','expired'].includes(j.status),true)); }
  run(deviceId:string,toolCode:string,action:string,parameters:unknown):Observable<JobRow>{ return this.create(deviceId,toolCode,action,parameters).pipe(switchMap(c=>this.watch(c.id))); }
  cancel(id:string):Observable<unknown>{ return this.http.post(`/api/v1/jobs/${id}/cancel`,{}); }
  artifacts(jobId:string):Observable<ArtifactRow[]>{ return this.http.get<ArtifactRow[]>(`/api/v1/jobs/${jobId}/artifacts`); }
  downloadArtifact(id:string):Observable<Blob>{ return this.http.get(`/api/v1/artifacts/${id}/download`,{responseType:'blob'}); }
  pretty(job:JobRow|null):string{ if(!job)return ''; if(job.resultJson){try{return JSON.stringify(JSON.parse(job.resultJson),null,2)}catch{return job.resultJson}} return job.stderr||job.stdout||''; }
}
