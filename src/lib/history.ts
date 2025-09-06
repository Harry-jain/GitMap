import { supabase, UserHistory } from './supabase'

export interface HistoryItem {
  id: string
  repo_url: string
  repo_name: string
  created_at: string
}

export class HistoryManager {
  private userId: string | null = null

  constructor(userId: string | null) {
    this.userId = userId
  }

  async getHistory(): Promise<HistoryItem[]> {
    if (!this.userId) {
      // Fallback to localStorage for non-authenticated users
      return this.getLocalHistory()
    }

    try {
      const { data, error } = await supabase
        .from('user_history')
        .select('id, repo_url, repo_name, created_at')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching history:', error)
        return this.getLocalHistory()
      }

      return data || []
    } catch (error) {
      console.error('Error fetching history:', error)
      return this.getLocalHistory()
    }
  }

  async addToHistory(repoUrl: string): Promise<void> {
    const repoName = this.extractRepoName(repoUrl)
    
    if (!this.userId) {
      // Fallback to localStorage for non-authenticated users
      this.addToLocalHistory(repoUrl)
      return
    }

    try {
      // Check if repo already exists in history
      const { data: existing } = await supabase
        .from('user_history')
        .select('id')
        .eq('user_id', this.userId)
        .eq('repo_url', repoUrl)
        .single()

      if (existing) {
        // Update the existing record's updated_at timestamp
        await supabase
          .from('user_history')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_history')
          .insert({
            user_id: this.userId,
            repo_url: repoUrl,
            repo_name: repoName,
          })

        if (error) {
          console.error('Error adding to history:', error)
          this.addToLocalHistory(repoUrl)
        }
      }
    } catch (error) {
      console.error('Error adding to history:', error)
      this.addToLocalHistory(repoUrl)
    }
  }

  async clearHistory(): Promise<void> {
    if (!this.userId) {
      // Fallback to localStorage for non-authenticated users
      this.clearLocalHistory()
      return
    }

    try {
      const { error } = await supabase
        .from('user_history')
        .delete()
        .eq('user_id', this.userId)

      if (error) {
        console.error('Error clearing history:', error)
        this.clearLocalHistory()
      }
    } catch (error) {
      console.error('Error clearing history:', error)
      this.clearLocalHistory()
    }
  }

  async removeFromHistory(repoUrl: string): Promise<void> {
    if (!this.userId) {
      // Fallback to localStorage for non-authenticated users
      this.removeFromLocalHistory(repoUrl)
      return
    }

    try {
      const { error } = await supabase
        .from('user_history')
        .delete()
        .eq('user_id', this.userId)
        .eq('repo_url', repoUrl)

      if (error) {
        console.error('Error removing from history:', error)
        this.removeFromLocalHistory(repoUrl)
      }
    } catch (error) {
      console.error('Error removing from history:', error)
      this.removeFromLocalHistory(repoUrl)
    }
  }

  // Local storage fallback methods
  private getLocalHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem('gitmap_history')
      if (!stored) return []
      
      const urls = JSON.parse(stored)
      return urls.map((url: string, index: number) => ({
        id: `local-${index}`,
        repo_url: url,
        repo_name: this.extractRepoName(url),
        created_at: new Date().toISOString(),
      }))
    } catch (error) {
      console.error('Error reading local history:', error)
      return []
    }
  }

  private addToLocalHistory(repoUrl: string): void {
    try {
      const stored = localStorage.getItem('gitmap_history')
      const history = stored ? JSON.parse(stored) : []
      const newHistory = [repoUrl, ...history.filter((url: string) => url !== repoUrl)].slice(0, 50)
      localStorage.setItem('gitmap_history', JSON.stringify(newHistory))
    } catch (error) {
      console.error('Error saving to local history:', error)
    }
  }

  private clearLocalHistory(): void {
    try {
      localStorage.removeItem('gitmap_history')
    } catch (error) {
      console.error('Error clearing local history:', error)
    }
  }

  private removeFromLocalHistory(repoUrl: string): void {
    try {
      const stored = localStorage.getItem('gitmap_history')
      if (!stored) return
      
      const history = JSON.parse(stored)
      const newHistory = history.filter((url: string) => url !== repoUrl)
      localStorage.setItem('gitmap_history', JSON.stringify(newHistory))
    } catch (error) {
      console.error('Error removing from local history:', error)
    }
  }

  private extractRepoName(url: string): string {
    try {
      const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/)
      return match ? match[1] : url
    } catch {
      return url
    }
  }
}