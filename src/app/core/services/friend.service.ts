import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { FriendRequest, FriendRequestStatus, Friendship, FriendProfile } from '../models/friend.model';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private baseUrl = environment.apiUrl;
  private friendsKey = 'user_friends';
  private requestsKey = 'friend_requests';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  
  // Get all friends for the current user
  getFriends(): Observable<FriendProfile[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    // In a real app, we would call an API
    // For demo, we'll use localStorage
    const friendships = this.getStoredFriendships()
      .filter(friendship => friendship.userIds.includes(user.id));
    
    // Convert friendships to profiles
    const friendProfiles: FriendProfile[] = [];
    
    // Mock data for demo purposes
    for (const friendship of friendships) {
      const friendId = friendship.userIds.find(id => id !== user.id);
      if (friendId) {
        friendProfiles.push({
          id: friendId,
          username: `User_${friendId.substring(0, 5)}`,
          avatar: 'assets/images/default-avatar.jpg',
          watchlistCount: Math.floor(Math.random() * 20) + 1,
          reviewsCount: Math.floor(Math.random() * 15),
          mutualFriendsCount: Math.floor(Math.random() * 5),
          isFriend: true
        });
      }
    }
    
    return of(friendProfiles);
  }
  
  // Get friend requests (sent and received)
  getFriendRequests(): Observable<FriendRequest[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    const requests = this.getStoredRequests()
      .filter(req => req.senderId === user.id || req.receiverId === user.id);
    
    return of(requests);
  }
  
  // Get incoming friend requests
  getIncomingRequests(): Observable<FriendRequest[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    const requests = this.getStoredRequests()
      .filter(req => req.receiverId === user.id && req.status === FriendRequestStatus.PENDING);
    
    return of(requests);
  }
  
  // Get outgoing friend requests
  getOutgoingRequests(): Observable<FriendRequest[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    const requests = this.getStoredRequests()
      .filter(req => req.senderId === user.id && req.status === FriendRequestStatus.PENDING);
    
    return of(requests);
  }
  
  // Send friend request
  sendFriendRequest(receiverId: string): Observable<FriendRequest | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    // Check if already friends or request exists
    const allRequests = this.getStoredRequests();
    const existingRequest = allRequests.find(req => 
      (req.senderId === user.id && req.receiverId === receiverId) ||
      (req.senderId === receiverId && req.receiverId === user.id)
    );
    
    if (existingRequest) {
      // Return existing request
      return of(existingRequest);
    }
    
    // Create new request
    const newRequest: FriendRequest = {
      id: this.generateId(),
      senderId: user.id,
      receiverId: receiverId,
      status: FriendRequestStatus.PENDING,
      createdAt: new Date()
    };
    
    // Save to storage
    const updatedRequests = [...allRequests, newRequest];
    localStorage.setItem(this.requestsKey, JSON.stringify(updatedRequests));
    
    return of(newRequest);
  }
  
  // Accept friend request
  acceptFriendRequest(requestId: string): Observable<Friendship | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    // Find request
    const allRequests = this.getStoredRequests();
    const requestToAccept = allRequests.find(req => req.id === requestId);
    
    if (!requestToAccept || requestToAccept.receiverId !== user.id) {
      return of(null);
    }
    
    // Update request status
    const updatedRequest = {
      ...requestToAccept,
      status: FriendRequestStatus.ACCEPTED,
      updatedAt: new Date()
    };
    
    const updatedRequests = allRequests.map(req => 
      req.id === requestId ? updatedRequest : req
    );
    
    localStorage.setItem(this.requestsKey, JSON.stringify(updatedRequests));
    
    // Create friendship
    const allFriendships = this.getStoredFriendships();
    const newFriendship: Friendship = {
      id: this.generateId(),
      userIds: [user.id, requestToAccept.senderId],
      createdAt: new Date()
    };
    
    const updatedFriendships = [...allFriendships, newFriendship];
    localStorage.setItem(this.friendsKey, JSON.stringify(updatedFriendships));
    
    return of(newFriendship);
  }
  
  // Decline friend request
  declineFriendRequest(requestId: string): Observable<FriendRequest | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    // Find request
    const allRequests = this.getStoredRequests();
    const requestToDecline = allRequests.find(req => req.id === requestId);
    
    if (!requestToDecline || requestToDecline.receiverId !== user.id) {
      return of(null);
    }
    
    // Update request status
    const updatedRequest = {
      ...requestToDecline,
      status: FriendRequestStatus.DECLINED,
      updatedAt: new Date()
    };
    
    const updatedRequests = allRequests.map(req => 
      req.id === requestId ? updatedRequest : req
    );
    
    localStorage.setItem(this.requestsKey, JSON.stringify(updatedRequests));
    
    return of(updatedRequest);
  }
  
  // Remove friend
  removeFriend(friendId: string): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(false);
    }
    
    // Find friendship
    const allFriendships = this.getStoredFriendships();
    const friendshipToRemove = allFriendships.find(fs => 
      fs.userIds.includes(user.id) && fs.userIds.includes(friendId)
    );
    
    if (!friendshipToRemove) {
      return of(false);
    }
    
    // Remove friendship
    const updatedFriendships = allFriendships.filter(fs => fs.id !== friendshipToRemove.id);
    localStorage.setItem(this.friendsKey, JSON.stringify(updatedFriendships));
    
    return of(true);
  }
  
  // Search for users
  searchUsers(query: string): Observable<FriendProfile[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    // Mock search results
    if (!query) {
      return of([]);
    }
    
    // In a real app, we would call an API to search
    // For demo, we'll generate mock results
    const mockResults: FriendProfile[] = [];
    const mockUserCount = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < mockUserCount; i++) {
      const mockId = this.generateId();
      const friendships = this.getStoredFriendships();
      const isFriend = friendships.some(fs => 
        fs.userIds.includes(user.id) && fs.userIds.includes(mockId)
      );
      
      const requests = this.getStoredRequests();
      let requestStatus = undefined;
      
      const sentRequest = requests.find(req => 
        req.senderId === user.id && req.receiverId === mockId
      );
      
      const receivedRequest = requests.find(req => 
        req.senderId === mockId && req.receiverId === user.id
      );
      
      if (sentRequest) {
        requestStatus = sentRequest.status;
      } else if (receivedRequest) {
        requestStatus = receivedRequest.status;
      }
      
      mockResults.push({
        id: mockId,
        username: `${query}_user_${i}`,
        avatar: 'assets/images/default-avatar.jpg',
        watchlistCount: Math.floor(Math.random() * 20) + 1,
        reviewsCount: Math.floor(Math.random() * 15),
        mutualFriendsCount: Math.floor(Math.random() * 5),
        isFriend,
        requestStatus
      });
    }
    
    return of(mockResults);
  }
  
  // Private helper methods
  private getStoredFriendships(): Friendship[] {
    const storedFriendships = localStorage.getItem(this.friendsKey);
    return storedFriendships ? JSON.parse(storedFriendships) : [];
  }
  
  private getStoredRequests(): FriendRequest[] {
    const storedRequests = localStorage.getItem(this.requestsKey);
    return storedRequests ? JSON.parse(storedRequests) : [];
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 