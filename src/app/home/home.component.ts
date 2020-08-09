import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { AdalService } from 'adal-angular4';
import {HttpClient, HttpErrorResponse, HttpEventType} from '@angular/common/http';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {HomeService} from './home.service';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user: any;
  profile: any;
  displayedColumns: string[] = ['id','stu_no','name'];
  data = [];
  @ViewChild("fileUpload") fileUpload: ElementRef;
  files  = [];
  constructor(private adalService: AdalService, protected http: HttpClient,protected homeService:HomeService) { }
  dataSource = new MatTableDataSource<PeriodicElement>();

  @ViewChild(MatPaginator) paginator: MatPaginator;


  ngOnInit() {

    this.user = this.adalService.userInfo;

    this.user.token = this.user.token.substring(0, 10) + '...';
    this.loadStudentInformation();
    this.dataSource.paginator = this.paginator;

  }
  studentGet(){
   return this.http.get("https://redis-cache-app.azurewebsites.net/student/get");
  }

  loadStudentInformation()
  {
    this.studentGet().subscribe({
      next: result => {
        console.log(result);
        this.data = result['data']['result'];
        this.dataSource.data = this.data;
      }
    });
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    file.inProgress = true;
    this.homeService.upload(formData).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        return of(`${file.data.name} upload failed.`);
      })).subscribe((event: any) => {
      if (typeof (event) === 'object') {
        console.log(event.body);
      }
    });
  }
  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
    });
  }
  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++)
      {
        const file = fileUpload.files[index];
        this.files.push({ data: file, inProgress: false, progress: 0});
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }
}

export interface PeriodicElement {
  name: string;
  id: number;
  stu_no: string;
}
