#!/bin/bash
# ChoserLife 卡片游戏 - 静态服务器启动脚本

# 停止现有服务
pkill -f "serve -s" 2>/dev/null

# 等待进程完全停止
sleep 2

# 启动静态文件服务器
cd /home/ubuntu/card-game-app/dist/build/h5
nohup serve -s . -l 3000 > /tmp/serve.log 2>&1 &

echo "服务器已启动，端口: 3000"
echo "日志文件: /tmp/serve.log"
