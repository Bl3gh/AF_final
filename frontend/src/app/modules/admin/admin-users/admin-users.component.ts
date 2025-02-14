// src/app/modules/admin/admin-users/admin-users.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  displayedColumns: string[] = ['id', 'email', 'name', 'role', 'registration_date', 'actions'];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: any[]) => { this.users = data; },
      error: (err: any) => { console.error('Error fetching users', err); }
    });
  }

  viewFavorites(user: any): void {
    console.log('View favorites for:', user);
    this.snackBar.open(`Showing favorites for ${user.name}`, 'Close', { duration: 3000 });
  }

  deleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`User ${user.name} deleted`, 'Close', { duration: 3000 });
          this.fetchUsers();
        },
        error: (err: any) => {
          console.error('Error deleting user', err);
          this.snackBar.open(`Error deleting ${user.name}`, 'Close', { duration: 3000 });
        }
      });
    }
  }
}
