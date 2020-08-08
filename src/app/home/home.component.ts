import { Component, OnInit, ViewChild } from '@angular/core';
import { AdalService } from 'adal-angular4';
import { HttpClient } from '@angular/common/http';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user: any;
  profile: any;
  displayedColumns: string[] = ['id','stu_no','name','fileupload'];
  data = [];
  constructor(private adalService: AdalService, protected http: HttpClient) { }

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
  public getProfile() {
    console.log('Get Profile called');
    return this.http.get("https://graph.microsoft.com/v1.0/me");
  }

  public profileClicked() {
    this.getProfile().subscribe({
      next: result => {
        console.log('Profile Response Received');
        this.profile = result;
      }
    });
  }
}

export interface PeriodicElement {
  name: string;
  id: number;
  stu_no: string;
}
