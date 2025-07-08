import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Header from "@/components/layout/Header";
import ChatInterface from "@/components/chat/ChatInterface";
import WorkflowPanel from "@/components/workflow/WorkflowPanel";
import SpeechToTextPanel from "@/components/stt/SpeechToTextPanel";
import TextToSpeechPanel from "@/components/tts/TextToSpeechPanel";
import ImageGenerationPanel from "@/components/image/ImageGenerationPanel";
import SettingsPanel from "@/components/settings/SettingsPanel";
import { useAppStore } from "@/lib/stores/useAppStore";

const tabInfo = {
  chat: {
    title: "Chat Hub",
    subtitle: "Orchestrate all AI APIs through conversation",
  },
  workflow: {
    title: "Workflow",
    subtitle: "Manage document processing and AI workflows",
  },
  stt: {
    title: "Speech-to-Text",
    subtitle: "Convert audio to text with high accuracy",
  },
  tts: {
    title: "Text-to-Speech",
    subtitle: "Generate natural-sounding speech from text",
  },
  image: {
    title: "Image Generation",
    subtitle: "Create stunning images with AI",
  },
  settings: {
    title: "Settings",
    subtitle: "Configure your API keys and preferences",
  },
};

export default function Dashboard() {
  const isMobile = useIsMobile();
  const { activeTab, setActiveTab } = useAppStore();

  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatInterface />;
      case "workflow":
        return <WorkflowPanel />;
      case "stt":
        return <SpeechToTextPanel />;
      case "tts":
        return <TextToSpeechPanel />;
      case "image":
        return <ImageGenerationPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {!isMobile && <Sidebar />}
      
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <Header 
          title={tabInfo[activeTab as keyof typeof tabInfo]?.title || "Chat Hub"}
          subtitle={tabInfo[activeTab as keyof typeof tabInfo]?.subtitle || "Orchestrate all AI APIs through conversation"}
        />
        
        <div className="p-4 lg:p-6 space-y-6">
          <div className="animate-fade-in">
            {renderTabContent()}
          </div>
        </div>
      </main>
      
      {isMobile && <MobileNav />}
    </div>
  );
}
