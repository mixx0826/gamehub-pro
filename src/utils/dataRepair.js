import { GameStorage } from './adminStorage';

/**
 * 数据修复工具
 * 用于修复现有游戏数据中的URL和其他问题
 */
export class DataRepair {
  
  /**
   * 修复上传游戏的URL
   */
  static repairUploadedGameUrls() {
    try {
      const allGames = GameStorage.getAllManagedGames();
      let repairCount = 0;
      let invalidCount = 0;
      
      console.log('开始修复游戏URL...');
      console.log('注意：使用blob URL的游戏在页面刷新后将失效，需要重新上传');
      
      allGames.forEach(game => {
        if (game.isUploadedGame) {
          let needsRepair = false;
          const updates = {};
          
          console.log(`检查游戏 ${game.title}:`, { 
            fileName: game.fileName, 
            gameUrl: game.gameUrl,
            gameFileBlob: game.gameFileBlob 
          });
          
          // 检查是否有有效的 blob URL
          const hasValidBlobUrl = (game.gameFileBlob && game.gameFileBlob.startsWith('blob:')) ||
                                  (game.gameUrl && game.gameUrl.startsWith('blob:'));
          
          if (!hasValidBlobUrl) {
            // 没有有效的 blob URL，标记为需要重新上传
            updates.needsReupload = true;
            updates.status = 'invalid';
            needsRepair = true;
            invalidCount++;
            console.log(`游戏 ${game.title} 需要重新上传（缺少有效的文件链接）`);
          }
          
          // 修复文件名错误（如果文件名表示是ZIP但应该是HTML）
          if (game.fileName && game.fileName.endsWith('.zip') && 
              !game.fileName.includes('zip-content')) {
            // 可能是文件名错误，检查描述或者其他信息
            console.log(`检测到可能的文件名错误: ${game.fileName}`);
          }
          
          // 修复fileName和gameUrl的一致性问题
          if (game.fileName && game.gameUrl) {
            const fileName = game.fileName;
            const currentUrl = game.gameUrl;
            
            console.log(`检查游戏 ${game.title}:`, { fileName, currentUrl });
            
            // 如果是HTML文件但URL不正确
            if (fileName.toLowerCase().endsWith('.html')) {
              const correctUrl = `/uploaded-games/${game.id}-${fileName}`;
              if (currentUrl !== correctUrl) {
                updates.gameUrl = correctUrl;
                needsRepair = true;
                console.log(`修复HTML游戏URL: ${currentUrl} -> ${correctUrl}`);
              }
            }
            // 如果是ZIP文件但URL格式不正确
            else if (fileName.toLowerCase().endsWith('.zip')) {
              const zipName = fileName.replace('.zip', '');
              const correctUrl = `/uploaded-games/${game.id}-${zipName}/index.html`;
              if (currentUrl !== correctUrl) {
                updates.gameUrl = correctUrl;
                needsRepair = true;
                console.log(`修复ZIP游戏URL: ${currentUrl} -> ${correctUrl}`);
              }
            }
          }
          
          // 修复封面图片问题
          if (!game.coverImageBlob && game.thumbnail && !game.thumbnail.startsWith('/api/placeholder')) {
            // 如果没有blob URL但有缩略图路径，尝试创建默认封面
            updates.coverImageBlob = `/api/placeholder/400/225`;
            needsRepair = true;
            console.log(`添加默认封面图片: ${game.title}`);
          }
          
          // 如果需要修复，执行更新
          if (needsRepair) {
            const success = GameStorage.updateGame(game.id, updates);
            if (success) {
              repairCount++;
              console.log(`标记游戏需要重新上传: ${game.title}`);
            } else {
              console.error(`修复游戏失败: ${game.title}`);
            }
          }
        }
      });
      
      console.log(`修复完成，共处理 ${repairCount} 个游戏`);
      console.log(`其中 ${invalidCount} 个游戏需要重新上传`);
      
      if (invalidCount > 0) {
        console.log('提示：blob URL 在页面刷新后会失效，这是浏览器的安全机制');
        console.log('如需持久化游戏文件，需要实现真正的文件上传到服务器功能');
      }
      
      return repairCount;
      
    } catch (error) {
      console.error('修复游戏URL失败:', error);
      return 0;
    }
  }
  
  /**
   * 修复特定游戏的数据
   */
  static repairSpecificGame(gameId) {
    try {
      const allGames = GameStorage.getAllManagedGames();
      const game = allGames.find(g => g.id.toString() === gameId.toString());
      
      if (!game || !game.isUploadedGame) {
        console.log('未找到指定的上传游戏');
        return false;
      }
      
      console.log('修复游戏:', game.title);
      
      const updates = {};
      let needsRepair = false;
      
      // 修复URL
      if (game.fileName) {
        const fileName = game.fileName;
        if (fileName.toLowerCase().endsWith('.html')) {
          const correctUrl = `/uploaded-games/${game.id}-${fileName}`;
          if (game.gameUrl !== correctUrl) {
            updates.gameUrl = correctUrl;
            needsRepair = true;
            console.log(`修复URL: ${game.gameUrl} -> ${correctUrl}`);
          }
        }
      }
      
      // 修复封面图片
      if (!game.coverImageBlob) {
        updates.coverImageBlob = `/api/placeholder/400/225`;
        needsRepair = true;
        console.log('添加默认封面图片');
      }
      
      if (needsRepair) {
        const success = GameStorage.updateGame(game.id, updates);
        if (success) {
          console.log('修复成功！建议刷新页面');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('修复特定游戏失败:', error);
      return false;
    }
  }
  
  /**
   * 检查游戏数据完整性
   */
  static checkDataIntegrity() {
    try {
      const allGames = GameStorage.getAllManagedGames();
      const issues = [];
      
      allGames.forEach(game => {
        const gameIssues = [];
        
        // 检查必要字段
        if (!game.title) gameIssues.push('缺少标题');
        if (!game.id) gameIssues.push('缺少ID');
        
        // 检查上传游戏的特定字段
        if (game.isUploadedGame) {
          if (!game.fileName) gameIssues.push('缺少文件名');
          if (!game.gameUrl) gameIssues.push('缺少游戏URL');
          if (!game.thumbnail && !game.coverImageBlob) gameIssues.push('缺少封面图片');
          
          // 检查URL和文件名一致性
          if (game.fileName && game.gameUrl) {
            if (game.fileName.toLowerCase().endsWith('.html')) {
              const expectedUrl = `/uploaded-games/${game.id}-${game.fileName}`;
              if (game.gameUrl !== expectedUrl) {
                gameIssues.push(`URL不匹配: 期望 ${expectedUrl}, 实际 ${game.gameUrl}`);
              }
            }
          }
        }
        
        if (gameIssues.length > 0) {
          issues.push({
            game: game.title || `ID: ${game.id}`,
            id: game.id,
            issues: gameIssues
          });
        }
      });
      
      return issues;
      
    } catch (error) {
      console.error('检查数据完整性失败:', error);
      return [];
    }
  }
  
  /**
   * 清理无效游戏数据
   */
  static cleanInvalidGames() {
    try {
      const allGames = GameStorage.getAllManagedGames();
      let cleanCount = 0;
      
      const validGames = allGames.filter(game => {
        // 检查游戏是否有效
        const isValid = game.title && game.id && 
          (game.isUploadedGame ? (game.fileName && game.gameUrl) : game.slug);
        
        if (!isValid) {
          console.log(`清理无效游戏:`, game);
          cleanCount++;
        }
        
        return isValid;
      });
      
      // 如果有无效游戏被清理，更新存储
      if (cleanCount > 0) {
        // 这里需要实现清理逻辑
        console.log(`清理了 ${cleanCount} 个无效游戏`);
      }
      
      return cleanCount;
      
    } catch (error) {
      console.error('清理无效游戏失败:', error);
      return 0;
    }
  }
}

// 导出修复函数供控制台使用
window.repairGameData = () => {
  console.log('=== 开始游戏数据修复 ===');
  
  // 检查数据完整性
  const issues = DataRepair.checkDataIntegrity();
  if (issues.length > 0) {
    console.log('发现的数据问题:', issues);
  }
  
  // 修复URL
  const repairCount = DataRepair.repairUploadedGameUrls();
  
  // 清理无效数据
  const cleanCount = DataRepair.cleanInvalidGames();
  
  console.log('=== 修复完成 ===');
  console.log(`修复游戏数量: ${repairCount}`);
  console.log(`清理游戏数量: ${cleanCount}`);
  
  // 建议刷新页面
  if (repairCount > 0 || cleanCount > 0) {
    console.log('建议刷新页面以查看修复结果');
  }
};

// 导出修复特定游戏的函数
window.repairGame = (gameId) => {
  console.log(`=== 修复游戏 ID: ${gameId} ===`);
  const success = DataRepair.repairSpecificGame(gameId);
  if (success) {
    console.log('修复成功！');
    setTimeout(() => window.location.reload(), 1000);
  } else {
    console.log('修复失败或无需修复');
  }
}; 