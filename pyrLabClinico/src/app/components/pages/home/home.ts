import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CardModule, ButtonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
