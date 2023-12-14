import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-download-files',
  standalone: true,
  imports: [],
  templateUrl: './download-files.component.html',
  styleUrl: './download-files.component.scss'
})
export class DownloadFilesComponent implements OnInit ,OnDestroy{
  public items: any;
  response_data: any;
  public show_loader: boolean = false;
  public show_loader_modal: boolean = false;
  fetchStatus: any;
  fileUrl: any;
  constructor(
    private dataService: DataService
  ) {}
  ngOnInit() {

    this.getObjects();
  }
  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.fetchStatus) {
      this.fetchStatus.unsubscribe();
    }
  }
  async getObjects() {
    const listObjects = await this.dataService
      .getObjects()
      .toPromise();
    this.items = listObjects.data;
  }
  selectedItems: string[] = [];
  toggleCheckbox(entry: string): void {
    this.selectedItems.push(entry);
  }
  async createZip() {
    if (this.fetchStatus) {
      this.fetchStatus.unsubscribe();
    }
    const data = {
      filePrefixes: this.selectedItems
    };
    try {
      this.show_loader = true;
      this.show_loader_modal = true;
      this.response_data = await this.dataService
        .createZip(data);
      if (this.response_data?.data?.id) {
        const timer$ = timer(2000, 5000);
        this.fetchStatus = timer$.subscribe(async () => {
          const response=await this.dataService
            .fetchStatus(this.response_data?.data?.id)
            .toPromise();
            if(response?.data?.data?.file_url){
              if(response?.data?.data?.file_url){
                this.fetchStatus.unsubscribe()
                const url=new URL(response?.data?.data?.file_url)
                this.fileUrl=url.pathname;
                this.show_loader = false;
              }
            }
        });
      }
    }
    catch (error) { }
  }
  close_modal(){
    this.show_loader_modal =false;
  }
  downloadZip(){
    window.location.href = `${environment.apiUrl}${this.fileUrl}`;
  }
}
